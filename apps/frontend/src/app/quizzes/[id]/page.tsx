'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    questionText: string;
    options: Option[];
    timeLimit: number;
}

export default function QuizStart() {
    const { data: session } = useSession();
    const params = useParams();
    const quizId = params?.id as string;

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
        null
    );
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const token = session?.accessToken;

    // Fetch First Question
    useEffect(() => {
        if (!quizId || !token) return;

        async function fetchFirstQuestion() {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/v1/quiz/${quizId}/start`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (data.question) {
                    setCurrentQuestion({
                        id: data.question.id,
                        questionText: data.question.questionText,
                        options: data.question.options,
                        timeLimit: data.question.timeLimit,
                    });
                    setTimeLeft(data.question.timeLimit);
                } else {
                    toast.error('No questions found.');
                    router.push('/');
                }
            } catch (error) {
                toast.error('Failed to start quiz.');
                router.push('/');
            }
        }

        fetchFirstQuestion();
    }, [quizId, token, router]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, currentQuestion]);

    // Auto-submit answer when time runs out
    useEffect(() => {
        if (timeLeft === 0 && currentQuestion && !isSubmitting) {
            handleSubmitAnswer();
        }
    }, [timeLeft, currentQuestion]);

    // Handle Answer Submission
    const handleSubmitAnswer = async () => {
        if (!currentQuestion) return;

        setIsSubmitting(true);

        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/v1/quiz/${quizId}/answer`,
                {
                    questionId: currentQuestion.id,
                    selectedOptionId: selectedOption || null,
                    timeTaken: currentQuestion.timeLimit - timeLeft,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.nextQuestion) {
                setCurrentQuestion({
                    id: data.nextQuestion.id,
                    questionText: data.nextQuestion.questionText,
                    options: data.nextQuestion.options,
                    timeLimit: data.nextQuestion.timeLimit,
                });
                setTimeLeft(data.nextQuestion.timeLimit);
                setSelectedOption(null);
            } else {
                toast.success('Quiz completed!');
                router.push(`/quizzes/${quizId}/results`);
            }
        } catch (error) {
            toast.error('Failed to submit answer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                {currentQuestion ? (
                    <div className="text-center">
                        {/* Question Text */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {currentQuestion.questionText}
                        </h2>

                        {/* Options List */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option.id}
                                    className={`w-full text-left py-3 px-4 rounded-md border transition duration-200 
                                        ${
                                            selectedOption === option.id
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                                        }`}
                                    onClick={() => setSelectedOption(option.id)}
                                    disabled={isSubmitting}
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>

                        {/* Timer */}
                        <p className="mt-4 text-gray-600 font-medium">
                            ⏳ Time Left:{' '}
                            <span className="text-red-500">{timeLeft}s</span>
                        </p>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={isSubmitting}
                            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">
                        Loading question...
                    </p>
                )}
            </div>
        </div>
    );
}
