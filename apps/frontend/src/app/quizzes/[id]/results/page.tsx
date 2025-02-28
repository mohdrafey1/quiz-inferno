'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Response {
    questionId: string;
    questionText: string;
    correctOption: string;
    selectedOption: string;
    isCorrect: boolean;
    timeTaken: number;
}

export default function QuizResults() {
    const [responses, setResponses] = useState<Response[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();

    const params = useParams();
    const quizId = params?.id as string;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = session?.accessToken;
                const { data } = await axios.get(
                    `http://localhost:5000/api/v1/quiz/results/${quizId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Mapping the API response data to fit the frontend structure
                const mappedResponses = data.result.map((res: any) => ({
                    questionId: res.questionId,
                    questionText: res.questionText,
                    correctOption: res.correctOption,
                    selectedOption: res.selectedOption,
                    isCorrect: res.isCorrect,
                    timeTaken: res.timeTaken,
                }));

                setResponses(mappedResponses);
            } catch (error) {
                toast.error('Failed to load results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [params.quizId, session, router]);

    if (loading) {
        return <p className="text-center mt-10">Loading results...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-semibold text-center mb-4">
                Quiz Results
            </h1>

            <div className="space-y-4">
                {responses.map((res) => (
                    <div
                        key={res.questionId}
                        className={`p-4 border rounded-md ${
                            res.isCorrect
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                        }`}
                    >
                        <p className="font-medium">{res.questionText}</p>
                        <p className="text-gray-700">
                            <strong>Your Answer:</strong> {res.selectedOption}
                        </p>
                        <p className="text-gray-700">
                            <strong>Correct Answer:</strong> {res.correctOption}
                        </p>
                        <p className="text-gray-700">
                            <strong>Time Taken:</strong> {res.timeTaken} seconds
                        </p>
                    </div>
                ))}
            </div>

            <button
                className="mt-6 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                onClick={() => router.push('/quizzes')}
            >
                Back to Quizzes
            </button>
        </div>
    );
}
