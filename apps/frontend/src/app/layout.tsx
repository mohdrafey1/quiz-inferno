import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import Providers from '@/components/Providers';
import AuthProvider from '@/components/SessionProvider';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Quiz App',
    description: 'A professional quiz platform',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <Providers>
                        <div className="flex">
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    duration: 3000,
                                }}
                            />
                            <Sidebar />
                            <main className="flex-1 transition-all md:ml-64">
                                {children}
                            </main>
                        </div>
                    </Providers>
                </AuthProvider>
            </body>
        </html>
    );
}
