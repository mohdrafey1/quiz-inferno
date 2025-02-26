'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
    FiMenu,
    FiX,
    FiHome,
    FiList,
    FiAward,
    FiUser,
    FiLogIn,
    FiLogOut,
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const handleLogout = async (): Promise<void> => {
        await signOut({ callbackUrl: '/' });
        toast.success('Logout Successful');
    };

    const menuItems = [
        { name: 'Home', path: '/', icon: <FiHome size={20} /> },
        { name: 'Quizzes', path: '/quizzes', icon: <FiList size={20} /> },
        { name: 'Hackathons', path: '/hackathons', icon: <FiList size={20} /> },
        { name: 'Events', path: '/events', icon: <FiList size={20} /> },
        {
            name: 'Leaderboard',
            path: '/leaderboard',
            icon: <FiAward size={20} />,
        },
        ...(session
            ? [
                  {
                      name: 'Profile',
                      path: '/profile',
                      icon: <FiUser size={20} />,
                  },
                  {
                      name: 'Logout',
                      path: '#',
                      icon: <FiLogOut size={20} />,
                      onClick: handleLogout,
                  },
              ]
            : [{ name: 'Login', path: '/login', icon: <FiLogIn size={20} /> }]),
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="md:hidden fixed top-3 right-4 z-50 p-2 rounded-md bg-gray-700 text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 p-5 space-y-6 bg-secondary shadow-md transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-64'
                } md:translate-x-0`}
            >
                {/* Header with Theme Toggle */}
                <div className="flex justify-between items-center p-3 bg-primary rounded-lg">
                    <h2 className="text-2xl font-bold">Quiz App</h2>
                    <ThemeToggle />
                </div>

                {/* Navigation Menu */}
                <nav>
                    <ul className="space-y-4">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                {item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className="flex items-center gap-2 py-2 px-4 rounded w-full text-left transition hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </button>
                                ) : (
                                    <Link
                                        href={item.path}
                                        className="flex items-center gap-2 py-2 px-4 rounded transition hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed ml-64 top-0 left-0 w-full h-full bg-black opacity-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
