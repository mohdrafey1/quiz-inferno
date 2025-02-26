import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prismaClient } from '@repo/db/client';

const authOptions: AuthOptions = {
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
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'google') {
                let dbUser = await prismaClient.user.findUnique({
                    where: { email: user.email! },
                });

                if (!dbUser) {
                    const generatedPassword =
                        Math.random().toString(36).slice(-8) +
                        Math.random().toString(36).slice(-8);
                    const hashedPassword = bcrypt.hashSync(
                        generatedPassword,
                        10
                    );
                    dbUser = await prismaClient.user.create({
                        data: {
                            email: user.email!,
                            username: profile?.name
                                ? profile.name.replace(/\s+/g, '').toLowerCase()
                                : 'user' +
                                  Math.random().toString(36).substring(2, 8),
                            password: hashedPassword,
                        },
                    });
                }
                return true;
            }
            return true;
        },
        async session({ session }: any) {
            if (session?.user) {
                const dbUser = await prismaClient.user.findUnique({
                    where: { email: session.user.email! },
                });

                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                }
            }
            return session;
        },
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
