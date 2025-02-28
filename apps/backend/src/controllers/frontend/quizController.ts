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

        let attempt = await prismaClient.userAttempt.findFirst({
            where: { userId, quizId, completed: false },
        });

        // If no existing attempt, create a new one
        if (!attempt) {
            await prismaClient.user.update({
                where: { id: userId },
                data: { currentBalance: { decrement: quiz.entryFee } },
            });

            attempt = await prismaClient.userAttempt.create({
                data: { userId, quizId: quizId as string },
            });
        }

        // Get the first question (always return first question on start)
        const firstQuestion = await prismaClient.question.findFirst({
            where: { quizId },
            orderBy: { id: 'asc' },
            include: { options: true },
        });

        res.json({ attemptId: attempt.id, question: firstQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to start quiz', error });
    }
};

// **2. Get Next Question**
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
            include: { options: true }, // Include options in the response
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

// **2. Submit Answer**
export const submitAnswer = async (req: AuthRequest, res: Response) => {
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

        // Fetch next question
        const nextQuestion = await prismaClient.question.findFirst({
            where: { quizId, id: { gt: questionId } },
            orderBy: { id: 'asc' },
            include: { options: true },
        });

        if (!nextQuestion) {
            // No more questions, mark quiz as complete
            await prismaClient.userAttempt.update({
                where: { id: attempt.id },
                data: { completed: true, finishedAt: new Date() },
            });

            res.json({
                message: 'Quiz completed',
                isCorrect,
                nextQuestion: null,
            });
            return;
        }

        res.json({ isCorrect, nextQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit answer', error });
    }
};

// **3. Complete Quiz**
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

export const confirmPayment = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { quizId } = req.body;
        const userId = req.user.id;

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
            where: { userId, quizId },
        });

        if (existingAttempt) {
            res.json({
                attemptId: existingAttempt.id,
                message: 'You Already Attempted this quiz',
                status: false,
            });
            return;
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: { currentBalance: { decrement: quiz.entryFee } },
        });

        const attempt = await prismaClient.userAttempt.create({
            data: { userId, quizId },
        });

        // Save the transaction for payment deduction
        await prismaClient.transaction.create({
            data: {
                userId,
                type: 'QuizAttempt',
                amount: quiz.entryFee,
                description: `Entry fee for quiz: ${quiz.title}`,
            },
        });

        res.json({
            success: true,
            attemptId: attempt.id,
            message: 'Payment confirmed and quiz attempt started.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to confirm payment', error });
    }
};

export const quizResult = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { quizId } = req.params;
        const userId = req.user?.id;

        if (!userId || !quizId) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
            });
            return;
        }

        // ✅ Find the user's attempt for the given quiz
        const userAttempt = await prismaClient.userAttempt.findFirst({
            where: {
                userId: userId,
                quizId: quizId,
            },
            select: { id: true },
        });

        if (!userAttempt) {
            res.status(404).json({
                success: false,
                message: 'User has not attempted this quiz.',
            });
            return;
        }

        // ✅ Fetch all questions of the quiz and their correct options
        const allQuestions = await prismaClient.question.findMany({
            where: {
                quizId: quizId,
            },
            select: {
                id: true,
                questionText: true,
                correctOptionId: true,
                options: {
                    select: {
                        id: true,
                        text: true, // Fetch the option text
                    },
                },
            },
        });

        // ✅ Fetch user responses for this quiz attempt
        const responses = await prismaClient.response.findMany({
            where: {
                userAttemptId: userAttempt.id, // Ensure correct attempt filtering
            },
            select: {
                id: true,
                questionId: true,
                selectedOptionId: true,
                isCorrect: true,
                timeTaken: true,
            },
        });

        // ✅ Merge responses with questions and options for better frontend display
        const resultData = allQuestions.map((question) => {
            const response = responses.find(
                (r) => r.questionId === question.id
            );

            // Find the correct option text
            const correctOption = question.options.find(
                (option) => option.id === question.correctOptionId
            );
            // Find the selected option text
            const selectedOption = question.options.find(
                (option) => option.id === response?.selectedOptionId
            );

            return {
                questionId: question.id,
                questionText: question.questionText,
                correctOption: correctOption ? correctOption.text : '',
                selectedOption: selectedOption ? selectedOption.text : '',
                isCorrect: response ? response.isCorrect : false,
                timeTaken: response ? response.timeTaken : 0,
            };
        });

        res.json({ success: true, result: resultData });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch results.',
        });
    }
};
