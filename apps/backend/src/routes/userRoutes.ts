import express, { Router } from 'express';
import { getProfile } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router: Router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/admin', authMiddleware, requireRole('ADMIN'), (req, res) => {
    res.json({ message: 'Welcome Admin' });
});

export default router;
