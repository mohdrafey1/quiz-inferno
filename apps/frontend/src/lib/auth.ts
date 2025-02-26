import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prismaClient } from '@repo/db/client';
import jwt from 'jsonwebtoken';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        accessToken?: string;
    }

    interface JWT {
        id: string;
        accessToken?: string;
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                const user = await prismaClient.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                return { id: user.id, email: user.email, name: user.username };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                let dbUser = await prismaClient.user.findUnique({
                    where: { email: user.email! },
                });

                if (!dbUser) {
                    dbUser = await prismaClient.user.create({
                        data: {
                            email: user.email!,
                            username: profile?.name
                                ? profile.name.replace(/\s+/g, '').toLowerCase()
                                : 'user' +
                                  Math.random().toString(36).substring(2, 8),
                            password: bcrypt.hashSync(
                                Math.random().toString(36).slice(-8) +
                                    Math.random().toString(36).slice(-8),
                                10
                            ),
                        },
                    });
                }

                // Assign the correct user ID to the `user` object
                user.id = dbUser.id;
            }
            return true;
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;

                // Generate a JWT manually for both Google and Credentials users
                token.accessToken = jwt.sign(
                    { id: user.id, email: user.email, role: 'USER' }, // Include role if applicable
                    process.env.JWT_SECRET as string,
                    { expiresIn: '7d' }
                );
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};
