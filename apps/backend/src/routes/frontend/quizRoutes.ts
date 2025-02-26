import express, { Router } from 'express';
import { prismaClient } from '@repo/db/client';
import { authMiddleware, AuthRequest } from '../../middlewares/authMiddleware';
import { z } from 'zod';

const router: Router = express.Router();

// Zod Schema for quiz validation
const quizSchema = z.object({
    title: z.string().min(1, 'Title is required'),
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
            })
        )
        .min(1, 'At least one question is required'),
});

// POST /api/quiz - Create a new quiz
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.format() });
        return;
    }

    const { title, entryFee, questions } = parsed.data;
    const userId = req.user.id;

    try {
        const quiz = await prismaClient.quiz.create({
            data: {
                title,
                entryFee,
                createdBy: userId,
                status: 'PENDING',
                questions: {
                    create: questions.map((q) => ({
                        questionText: q.questionText,
                        timeLimit: 30,
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
});

export default router;
