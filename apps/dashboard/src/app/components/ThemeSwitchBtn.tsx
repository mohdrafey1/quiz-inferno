'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSwitchBtn = () => {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8"></div>;

    const currentTheme = theme === 'system' ? systemTheme : theme;

    return (
        <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition duration-300 flex items-center justify-center w-10 h-10"
        >
            {currentTheme === 'dark' ? (
                <FiSun size={20} />
            ) : (
                <FiMoon size={20} />
            )}
        </button>
    );
};

export default ThemeSwitchBtn;
