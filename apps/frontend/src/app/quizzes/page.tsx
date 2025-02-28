'use client';

import { useEffect, useState } from 'react';
import QuizCard from '@/components/Quiz/QuizCard';
import Link from 'next/link';
import { Spinner } from '@repo/ui/Spinner';

interface Quiz {
    id: string;
    title: string;
    description: string;
    entryFee: number;
    createdBy: string;
    attempts: {
        userId: string;
        score: number;
        completed: boolean;
        user: {
            id: string;
            email: string;
            username: string;
        };
    }[];
}

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/quiz');
                const data = await response.json();
                setQuizzes(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                setError(error as string);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    console.log(quizzes);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size={3} />
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4 my-4 ">
            <div className="flex ">
                <Link
                    href={'/quizzes/add-quiz'}
                    className=" p-3  bg-primary mx-auto text-white rounded-lg shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                    <span>Add Quiz</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                ))}
            </div>
        </div>
    );
}
