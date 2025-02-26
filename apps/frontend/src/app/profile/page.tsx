'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@repo/ui/Spinner';

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size={1.5} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                    Profile
                </h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                        </label>
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                            {session?.user?.name}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}
