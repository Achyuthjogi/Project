import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const notifications = await prisma.notification.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limit to 20 recent
        });

        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await req.json();

        const notification = await prisma.notification.findUnique({ where: { id } });

        if (!notification || notification.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json({ message: 'Notification marked as read', notification: updated }, { status: 200 });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
