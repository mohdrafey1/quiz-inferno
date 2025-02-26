'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
        });

        if (res.ok) {
            toast.success('Signup Successful! Please Login.');
            router.push('/login');
        } else {
            toast.error('Signup Failed. Please Try Again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                    Sign Up
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Create an account to get started.
                </p>
                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
