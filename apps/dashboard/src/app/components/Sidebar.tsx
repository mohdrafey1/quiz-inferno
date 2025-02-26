'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeSwitchBtn from './ThemeSwitchBtn';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Manage Quizzes', path: '/dashboard/quizzes' },
    { name: 'Users', path: '/dashboard/users' },
    { name: 'Settings', path: '/dashboard/settings' },
];

export const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen shadow-lg bg-gray-700 dark:bg-gray-800 text-white w-64 p-5 space-y-6 overflow-y-auto transition-transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-64'
                } md:translate-x-0 md:relative md:flex md:flex-col`}
            >
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <nav className="flex-1">
                    <ul className="space-y-4">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className="block py-2 px-4 rounded hover:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Theme Switch Button */}
                <div className="mt-auto">
                    <ThemeSwitchBtn />
                </div>
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
