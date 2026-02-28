import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const emotion = searchParams.get('emotion');
        const category = searchParams.get('category');
        const dashboard = searchParams.get('dashboard') === 'true';

        let userId = null;
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) userId = decoded.userId;
        }

        // Base query
        let where = {};
        if (emotion) where.emotion = emotion;
        if (category) where.category = category;

        // For dashboard, only show own posts
        if (dashboard) {
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            where.authorId = userId;
        }

        const posts = await prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: dashboard ? { select: { email: true } } : false,
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: { author: dashboard ? { select: { email: true } } : false }
                }
            }
        });

        // Strip authorId for feed to ensure absolute anonymity
        const sanitizedPosts = posts.map(entry => {
            const post = { ...entry };
            if (!dashboard) {
                delete post.authorId;
            }

            const isMine = userId && (entry.authorId === userId);
            delete post.authorId;

            // Also mask comment authors
            const sanitizedComments = post.comments.map(c => {
                const comment = { ...c };
                const isCommentMine = userId && (comment.authorId === userId);
                if (!dashboard) delete comment.authorId;
                return { ...comment, isMine: isCommentMine };
            });

            return { ...post, comments: sanitizedComments, isMine };
        });

        return NextResponse.json({ posts: sanitizedPosts }, { status: 200 });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { content, emotion, category } = await req.json();

        if (!content || !emotion || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                content,
                emotion,
                category,
                authorId: decoded.userId,
                // isAnonymous is default true
            },
        });

        // Don't leak authorId in response
        const sanitizedPost = { ...post };
        delete sanitizedPost.authorId;

        return NextResponse.json({ post: sanitizedPost, message: 'Post created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
