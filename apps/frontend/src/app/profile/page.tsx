'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '@/redux/slices/userSlice';
import { RootState, AppDispatch } from '@/redux/store';
import { Spinner } from '@repo/ui/Spinner';
import { useSession } from 'next-auth/react';

export default function Profile() {
    const { status } = useSession();

    const dispatch = useDispatch<AppDispatch>();
    const { username, email, currentBalance, totalEarning, loading, error } =
        useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (status === 'authenticated') {
            dispatch(fetchUserData());
        }
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size={3} />
            </div>
        );
    }

    if (error) {
        return <div>Something error occured</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-lg p-6 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
                    Profile
                </h1>
                <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-white">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-xl font-semibold">
                            ₹{currentBalance ?? '0.00'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Earnings</p>
                        <p className="text-xl font-semibold">
                            ₹{totalEarning ?? '0.00'}
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                        </label>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {username || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {email || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500">
                        Add Balance
                    </button>
                    <button className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500">
                        Redeem Balance
                    </button>
                </div>
            </div>
        </div>
    );
}
