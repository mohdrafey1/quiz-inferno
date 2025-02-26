'use client';

import { useState } from 'react';

export default function Home() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDot = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="p-6 bg-background text-foreground min-h-screen">
            {/* Dot Button and Dropdown */}
            <button
                onClick={handleDot}
                className=" p-3  bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
                <span>Add Now</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="relative">
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="fixed mt-2 w-56 bg-white dark:bg-black rounded-lg shadow-lg border border-secondary dark:border-darkSecondary z-50">
                        <div className="p-2 space-y-2">
                            <div className="p-2 hover:bg-secondary  rounded-lg cursor-pointer transition-colors">
                                Add Quiz
                            </div>
                            <div className="p-2 hover:bg-secondary  rounded-lg cursor-pointer transition-colors">
                                Add Event
                            </div>
                            <div className="p-2 hover:bg-secondary  rounded-lg cursor-pointer transition-colors">
                                Add Hackathon
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Featured Sections */}
            <div className="max-w-7xl mx-auto">
                {/* Featured Quizzes */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6 text-primary">
                        Featured Quizzes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder for Featured Quizzes */}
                        <div className="p-6 bg-white dark:bg-gray-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold mb-2">
                                Quiz Title
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quiz description goes here.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Featured Hackathons */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6 text-primary">
                        Featured Hackathons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder for Featured Hackathons */}
                        <div className="p-6 bg-white dark:bg-gray-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold mb-2">
                                Hackathon Title
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Hackathon description goes here.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Featured Events */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6 text-primary">
                        Featured Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder for Featured Events */}
                        <div className="p-6 bg-white dark:bg-gray-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold mb-2">
                                Event Title
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Event description goes here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
