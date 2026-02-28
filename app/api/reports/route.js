import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { postId, reason } = await req.json();

        if (!postId || !reason) {
            return NextResponse.json({ error: 'Post ID and reason are required' }, { status: 400 });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Don't let users report their own posts (optional, but good practice)
        if (post.authorId === decoded.userId) {
            return NextResponse.json({ error: 'Cannot report your own post' }, { status: 400 });
        }

        // Check if already reported
        const existingReport = await prisma.report.findFirst({
            where: { postId, reporterId: decoded.userId }
        });

        if (existingReport) {
            return NextResponse.json({ error: 'You have already reported this post' }, { status: 409 });
        }

        const report = await prisma.report.create({
            data: {
                postId,
                reason,
                reporterId: decoded.userId,
            },
        });

        // Notify the actual author
        await prisma.notification.create({
            data: {
                userId: post.authorId,
                message: `Your post in ${post.category} was flagged by the community for review.`,
            }
        });

        return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error('Report post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
