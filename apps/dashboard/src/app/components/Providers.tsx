'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="opacity-0">{children}</div>;
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <div className="transition-colors duration-300 min-h-screen">
                {children}
            </div>
        </ThemeProvider>
    );
}
