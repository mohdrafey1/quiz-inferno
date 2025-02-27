'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchUserData } from '@/redux/slices/userSlice';
import { useSession } from 'next-auth/react';

interface Quiz {
    id: string;
    title: string;
    description: string;
    entryFee: number;
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
    const [showModal, setShowModal] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { status } = useSession();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (status === 'authenticated') {
            dispatch(fetchUserData());
        }
    }, [status, dispatch]);

    const { currentBalance } = useSelector((state: RootState) => state.user);
    const currentBalanceNumber = parseFloat(currentBalance || '0');

    const handleConfirmPurchase = async () => {
        if (!agreeTerms) {
            toast.error('You must agree to the terms and conditions.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('http://localhost:5000/api/v1/quiz/pay', {
                quizId: quiz.id,
            });

            toast.success('Payment successful! Redirecting to quiz...');
            setShowModal(false);

            router.push(`/quiz/${quiz.id}/start`);
        } catch (error) {
            toast.error('Failed to process payment.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBalance = () => {
        toast.success('Redirecting to add balance page...');
        router.push('/add-balance');
    };

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-lg font-semibold mt-2">{quiz.title}</h2>
                <p className="text-gray-600">{quiz.description}</p>
                <button
                    className="p-2 rounded-md bg-primary text-white mt-2"
                    onClick={() => setShowModal(true)}
                >
                    Pay {quiz.entryFee}
                </button>
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold text-center">
                            Confirm Payment
                        </h2>
                        <p className="mt-2">
                            <span className="font-medium">
                                Current Balance:
                            </span>{' '}
                            ₹{currentBalance}
                        </p>
                        <p className="mt-2">
                            <span className="font-medium">Entry Fee:</span> ₹
                            {quiz.entryFee}
                        </p>
                        {currentBalanceNumber <= quiz.entryFee ? (
                            <p className="text-red-500 mt-4">
                                Your Balance is insufficient , Please Add
                                Balance
                            </p>
                        ) : (
                            <div>
                                <label className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={() =>
                                            setAgreeTerms(!agreeTerms)
                                        }
                                        className="mr-2"
                                    />
                                    I agree to the Terms & Conditions
                                </label>
                            </div>
                        )}

                        <div className="flex justify-between mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            {currentBalanceNumber >= quiz.entryFee ? (
                                <button
                                    className={`px-4 py-2 rounded ${
                                        loading
                                            ? 'bg-gray-500'
                                            : 'bg-blue-500 text-white'
                                    }`}
                                    disabled={loading}
                                    onClick={handleConfirmPurchase}
                                >
                                    {loading
                                        ? 'Processing...'
                                        : 'Confirm & Start'}
                                </button>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                    onClick={handleAddBalance}
                                >
                                    Add Balance
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
