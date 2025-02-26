import { Response } from 'express';
import { prismaClient } from '@repo/db/client';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'You are not logged in' });
            return;
        }

        const user = await prismaClient.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                currentBalance: true,
                totalEarning: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
