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

        const { content, postId } = await req.json();

        if (!content || !postId) {
            return NextResponse.json({ error: 'Comment content and associated postId are required.' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: decoded.userId,
            }
        });

        // Delete the authorId so it isn't returned back to frontend implicitly
        const sanitizedComment = { ...comment };
        delete sanitizedComment.authorId;
        sanitizedComment.isMine = true;

        return NextResponse.json({ comment: sanitizedComment, message: 'Comment posted successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json({ error: 'Internal server error while creating comment.' }, { status: 500 });
    }
}
