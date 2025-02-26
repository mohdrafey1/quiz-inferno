import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prismaClient, Role } from '@repo/db/client';
import { generateToken } from '../utils/generateToken';
import dotenv from 'dotenv';
dotenv.config();

// Secret codes fetched from .env
const SECRET_CODES: Record<string, string | undefined> = {
    ADMIN: process.env.ADMIN_SECRET_CODE,
    MODERATOR: process.env.MODERATOR_SECRET_CODE,
};

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, username, password, role, secret_code } = req.body;

        // Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const existingUsername = await prismaClient.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            res.status(400).json({ message: 'Username has been taken' });
            return;
        }

        // Validate secret_code for roles other than USER
        let userRole: Role = Role.USER;
        if (role && SECRET_CODES[role as keyof typeof SECRET_CODES]) {
            if (
                secret_code !== SECRET_CODES[role as keyof typeof SECRET_CODES]
            ) {
                res.status(403).json({
                    message: 'Invalid secret code for role assignment',
                });
                return;
            }
            userRole = role as Role;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prismaClient.user.create({
            data: { email, username, password: hashedPassword, role: userRole },
        });

        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        res.json({ token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
