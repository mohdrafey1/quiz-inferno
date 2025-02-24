import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prismaClient } from '@repo/db/client';
import { generateToken } from '../utils/generateToken';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, username, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Assign role (default to USER if not provided)
        const userRole =
            role && ['USER', 'ADMIN', 'MODERATOR'].includes(role)
                ? role
                : 'USER';

        // Create user
        const user = await prismaClient.user.create({
            data: { email, username, password: hashedPassword, role: userRole },
        });

        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
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
