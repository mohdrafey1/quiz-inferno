'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const AddQuiz = () => {
    const { data: session } = useSession();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [entryFee, setEntryFee] = useState(0);
    const [questions, setQuestions] = useState([
        {
            questionText: '',
            options: ['', ''],
            correctOptionIndex: 0,
            timeLimit: 10,
        },
    ]);
    const [error, setError] = useState('');

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                questionText: '',
                options: ['', ''],
                correctOptionIndex: 0,
                timeLimit: 10,
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionText = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (
        qIndex: number,
        oIndex: number,
        value: string
    ) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuestions(updatedQuestions);
    };

    const addOption = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].options.push('');
        setQuestions(updatedQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(updatedQuestions);
    };

    const handleCorrectOptionChange = (qIndex: number, value: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].correctOptionIndex = value;
        setQuestions(updatedQuestions);
    };

    const handleTimeLimitChange = (index: number, value: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].timeLimit = value;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (!description.trim()) {
            setError('Description is required');
            return;
        }
        if (entryFee < 0) {
            setError('Entry fee must be a non-negative number');
            return;
        }
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) {
                setError(`Question ${i + 1} is required`);
                return;
            }
            if (questions[i].options.length < 2) {
                setError(`Question ${i + 1} must have at least two options`);
                return;
            }
            if (
                questions[i].correctOptionIndex >= questions[i].options.length
            ) {
                setError(`Invalid correct option index for question ${i + 1}`);
                return;
            }
        }

        try {
            const token = session?.accessToken;
            await axios.post(
                'http://localhost:5000/api/v1/quiz',
                { title, description, entryFee, questions },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Quiz added successfully!');
            setTitle('');
            setDescription('');
            setEntryFee(0);
            setQuestions([
                {
                    questionText: '',
                    options: ['', ''],
                    correctOptionIndex: 0,
                    timeLimit: 10,
                },
            ]);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to add quiz');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Add Quiz</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Quiz Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-medium">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-medium">Entry Fee:</label>
                    <input
                        type="number"
                        value={entryFee}
                        onChange={(e) => setEntryFee(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* Questions Section */}
                <div>
                    <h3 className="text-xl font-semibold">Questions</h3>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="border p-4 rounded mb-4">
                            <label className="block font-medium">
                                Question {qIndex + 1}:
                            </label>
                            <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) =>
                                    handleQuestionChange(qIndex, e.target.value)
                                }
                                className="w-full border p-2 rounded"
                            />
                            <div>
                                <h4 className="mt-2">Options:</h4>
                                {q.options.map((opt, oIndex) => (
                                    <div
                                        key={oIndex}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    qIndex,
                                                    oIndex,
                                                    e.target.value
                                                )
                                            }
                                            className="border p-2 w-full rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeOption(qIndex, oIndex)
                                            }
                                            className="text-red-500"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addOption(qIndex)}
                                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    ➕ Add Option
                                </button>
                            </div>

                            {/* Correct Option Selection */}
                            <div className="mt-2">
                                <label className="block font-medium">
                                    Correct Option:
                                </label>
                                <select
                                    value={q.correctOptionIndex}
                                    onChange={(e) =>
                                        handleCorrectOptionChange(
                                            qIndex,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="border p-2 rounded"
                                >
                                    {q.options.map((opt, idx) => (
                                        <option key={idx} value={idx}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Time Limit Selection */}
                            <div className="mt-2">
                                <label className="block font-medium">
                                    Time Limit:
                                </label>
                                <select
                                    value={q.timeLimit}
                                    onChange={(e) =>
                                        handleTimeLimitChange(
                                            qIndex,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="border p-2 rounded"
                                >
                                    <option value={10}>10 sec</option>
                                    <option value={20}>20 sec</option>
                                    <option value={30}>30 sec</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="mt-2 text-red-500"
                            >
                                ❌ Remove Question
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                    >
                        ➕ Add Question
                    </button>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Submit Quiz
                </button>
            </form>
        </div>
    );
};

export default AddQuiz;
