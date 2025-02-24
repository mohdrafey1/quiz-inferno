import { Request, Response, NextFunction } from 'express';
import { prismaClient } from '@repo/db/client';
import { AuthRequest } from './authMiddleware';

export const requireRole = (role: 'ADMIN' | 'MODERATOR') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await prismaClient.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user || user.role !== role) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        next();
    };
};
