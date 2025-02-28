import { NextResponse } from 'next/server';
import { prismaClient } from '@repo/db/client';

export async function GET() {
    try {
        const quizzes = await prismaClient.quiz.findMany({
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            include: {
                attempts: {
                    // Include the attempts made on the quiz
                    include: {
                        user: true, // Include the user who made the attempt
                    },
                },
            },
        });

        // Now quizzes will contain the attempts and the users who attempted
        return NextResponse.json(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
