import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from './components/Sidebar';
import Providers from './components/Providers';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Quiz Inferno Dashboard',
    description: 'Lets Make the Impact',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <Providers>
                    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                        {/* Sidebar (Fixed) */}
                        <Sidebar />

                        {/* Main Content (Responsive & Pushes Sidebar) */}
                        <main className="flex-1 p-6 transition-all md:ml-64">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
