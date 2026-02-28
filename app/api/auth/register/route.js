import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, getCookieSettings } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !email.includes('@') || !password || password.length < 6) {
            return NextResponse.json(
                { error: 'A valid email is required and password must be at least 6 characters.' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });

        await prisma.notification.create({
            data: {
                userId: user.id,
                message: 'Welcome to Emotion Share! This is a safe space to share your feelings anonymously. Jump into the community feed to view stories.',
            }
        });

        const token = signToken({ userId: user.id, email: user.email });

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('authToken', token, getCookieSettings());

        return NextResponse.json({
            user: { id: user.id, email: user.email },
            message: 'Registration successful'
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
