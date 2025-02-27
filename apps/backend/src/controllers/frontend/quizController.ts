import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { z } from 'zod';

// Zod Schema for quiz validation
const quizSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    entryFee: z.number().nonnegative('Entry fee must be a non-negative number'),
    questions: z
        .array(
            z.object({
                questionText: z.string().min(1, 'Question text is required'),
                options: z
                    .array(z.string().min(1, 'Option cannot be empty'))
                    .min(2, 'At least two options required'),
                correctOptionIndex: z
                    .number()
                    .int()
                    .min(0, 'Invalid correct option index'),
                timeLimit: z.number().int().min(10).max(30).default(10),
            })
        )
        .min(1, 'At least one question is required'),
});

export const addQuiz = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.format() });
        return;
    }

    const { title, entryFee, questions, description } = parsed.data;
    const userId = req.user.id;

    try {
        const quiz = await prismaClient.quiz.create({
            data: {
                title,
                entryFee,
                description,
                createdBy: userId,
                status: 'PENDING',
                questions: {
                    create: questions.map((q) => ({
                        questionText: q.questionText,
                        timeLimit: q.timeLimit,
                        options: {
                            create: q.options.map((text) => ({ text })),
                        },
                        correctOptionId: '',
                    })),
                },
            },
            include: { questions: { include: { options: true } } },
        });

        if (!quiz.questions || quiz.questions.length === 0) {
            res.status(500).json({
                success: false,
                message: 'Quiz questions were not created properly.',
            });
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const quizQuestion = quiz.questions[i];

            // Ensure the question exists
            const question = questions[i];
            if (!question) {
                res.status(500).json({
                    success: false,
                    message: `Error: Question at index ${i} is undefined.`,
                });
                return;
            }

            if (
                !quizQuestion ||
                !quizQuestion.options ||
                quizQuestion.options.length === 0
            ) {
                res.status(500).json({
                    success: false,
                    message: `Error creating quiz: options not found for question ${i + 1}`,
                });
                return;
            }

            if (question.correctOptionIndex >= quizQuestion.options.length) {
                res.status(400).json({
                    success: false,
                    message: `Invalid correct option index for question ${i + 1}`,
                });
                return;
            }

            const correctOption =
                quizQuestion.options[question.correctOptionIndex];

            if (!correctOption) {
                res.status(400).json({
                    success: false,
                    message: `Invalid correct option index for question ${i + 1}`,
                });
                return;
            }

            await prismaClient.question.update({
                where: { id: quizQuestion.id },
                data: { correctOptionId: correctOption.id },
            });
        }

        res.status(201).json({ success: true, quiz });
        return;
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error,
        });
        return;
    }
};

// **1. Start Quiz**
export const startQuiz = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const { quizId } = req.params;

        const quiz = await prismaClient.quiz.findUnique({
            where: { id: quizId },
        });
        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.currentBalance < quiz.entryFee) {
            res.status(400).json({ message: 'Insufficient balance' });
            return;
        }

        const existingAttempt = await prismaClient.userAttempt.findFirst({
            where: { userId, quizId, completed: false },
        });

        if (existingAttempt) {
            res.json({ attemptId: existingAttempt.id });
            return;
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: { currentBalance: { decrement: quiz.entryFee } },
        });

        const attempt = await prismaClient.userAttempt.create({
            data: { userId, quizId: quizId as string },
        });

        const firstQuestion = await prismaClient.question.findFirst({
            where: { quizId },
            orderBy: { id: 'asc' },
        });

        res.json({ attemptId: attempt.id, firstQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to start quiz', error });
    }
};

// **2. Submit Answer**
export const submitAnswer = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const { quizId } = req.params;
        const { questionId, selectedOptionId, timeTaken } = req.body;

        const attempt = await prismaClient.userAttempt.findFirst({
            where: { userId, quizId, completed: false },
        });

        if (!attempt) {
            res.status(400).json({
                message: 'Quiz attempt not found or already completed',
            });
            return;
        }

        const question = await prismaClient.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }

        const isCorrect = question.correctOptionId === selectedOptionId;

        await prismaClient.response.create({
            data: {
                userAttemptId: attempt.id,
                questionId,
                selectedOptionId,
                isCorrect,
                timeTaken,
            },
        });

        const nextQuestion = await prismaClient.question.findFirst({
            where: { quizId, id: { gt: questionId } },
            orderBy: { id: 'asc' },
        });

        res.json({ isCorrect, nextQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit answer', error });
    }
};

// **3. Get Next Question**
export const getNextQuestion = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { quizId } = req.params;
        const { lastQuestionId } = req.query;

        const nextQuestion = await prismaClient.question.findFirst({
            where: { quizId, id: { gt: lastQuestionId as string } },
            orderBy: { id: 'asc' },
        });

        if (!nextQuestion) {
            res.json({ message: 'Quiz completed' });
            return;
        }

        res.json(nextQuestion);
        return;
    } catch (error) {
        res.status(500).json({ message: 'Failed to get next question', error });
        return;
    }
};

// **4. Complete Quiz**
export const completeQuiz = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;
        const { quizId } = req.params;

        const attempt = await prismaClient.userAttempt.update({
            where: { userId_quizId: { userId, quizId: quizId as string } },
            data: { completed: true, finishedAt: new Date() },
        });

        res.json({ message: 'Quiz completed successfully', attempt });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Failed to complete quiz', error });
        return;
    }
};
