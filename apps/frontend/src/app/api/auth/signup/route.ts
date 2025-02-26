import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prismaClient } from '@repo/db/client';

export async function POST(req: Request) {
    try {
        const { email, password, username } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json(
                { error: 'Missing fields' },
                { status: 400 }
            );
        }

        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prismaClient.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'USER',
            },
        });

        return NextResponse.json(
            { message: 'User created', user: newUser },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
