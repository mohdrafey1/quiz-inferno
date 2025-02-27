import { NextResponse } from 'next/server';
import { prismaClient } from '@repo/db/client';

export async function GET() {
    try {
        const quizzes = await prismaClient.quiz.findMany({
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
