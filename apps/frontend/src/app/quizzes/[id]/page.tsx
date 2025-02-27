'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    timeLimit: number;
}

export default function QuizStart({ params }: { params: { id: string } }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const router = useRouter();

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/v1/quiz/${params.id}/questions`
                );
                setQuestions(data);
                setTimeLeft(data[0].timeLimit);
            } catch (error) {
                toast.error('Failed to load quiz.');
                router.push('/');
            }
        }
        fetchQuestions();
    }, [params.id, router]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === 0 && questions.length > 0) {
            handleSubmitAnswer();
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleSubmitAnswer = async () => {
        if (selectedOption === null) {
            toast.error('Please select an option.');
            return;
        }

        try {
            await axios.post(
                `http://localhost:5000/api/v1/quiz/${params.id}/submit`,
                {
                    questionId: questions[currentQuestionIndex].id,
                    selectedOption,
                }
            );

            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setTimeLeft(questions[currentQuestionIndex + 1].timeLimit);
                setSelectedOption(null);
            } else {
                toast.success('Quiz completed!');
                router.push(`/quiz/${params.id}/results`);
            }
        } catch (error) {
            toast.error('Failed to submit answer.');
        }
    };

    if (questions.length === 0) return <p>Loading...</p>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-lg font-semibold">
                {currentQuestion.questionText}
            </h2>
            <p className="text-gray-500">Time Left: {timeLeft}s</p>

            <div className="mt-4">
                {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                        <input
                            type="radio"
                            id={`option-${index}`}
                            checked={selectedOption === index}
                            onChange={() => setSelectedOption(index)}
                            className="mr-2"
                        />
                        <label htmlFor={`option-${index}`}>{option}</label>
                    </div>
                ))}
            </div>

            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSubmitAnswer}
            >
                Submit Answer
            </button>
        </div>
    );
}
