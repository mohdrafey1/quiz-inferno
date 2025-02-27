'use client';

import { store } from '@/redux/store';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Provider store={store}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    {children}
                </ThemeProvider>
            </Provider>
        </SessionProvider>
    );
}
