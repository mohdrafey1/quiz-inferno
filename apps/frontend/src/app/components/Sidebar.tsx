'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Quizzes', path: '/quizzes' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Profile', path: '/profile' },
];

export const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="md:hidden fixed top-2 right-4 z-50 p-2 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 p-5 space-y-6 transform shadow-md bg-secondary  ${
                    isOpen ? 'translate-x-0' : '-translate-x-64'
                } transition-transform md:translate-x-0`}
            >
                <div className="flex justify-between items-center p-1 bg-primary rounded-lg">
                    <h2 className="text-2xl font-bold">Quiz App</h2>
                    <ThemeToggle />
                </div>
                <nav>
                    <ul className="space-y-4">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className="block py-2 px-4 rounded transition"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed bg-black opacity-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
