'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Spinner } from '@repo/ui/Spinner';

export default function Profile() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then((res) => res.json())
                .then((data) => setUser(data.user || null))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size={3} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="w-full max-w-lg p-6 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
                    Profile
                </h1>
                <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-white">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-xl font-semibold">
                            ₹{user?.currentBalance ?? '0.00'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Earnings</p>
                        <p className="text-xl font-semibold">
                            ₹{user?.totalEarning ?? '0.00'}
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                        </label>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {user?.username || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {user?.email || 'N/A'}
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
