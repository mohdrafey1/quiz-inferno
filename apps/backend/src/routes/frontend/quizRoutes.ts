import express, { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
    addQuiz,
    completeQuiz,
    getNextQuestion,
    startQuiz,
    submitAnswer,
} from '../../controllers/frontend/quizController';

const router: Router = express.Router();

// POST /api/quiz - Create a new quiz
router.post('/', authMiddleware, addQuiz);

router.post('/:quizId/start', authMiddleware, startQuiz);
router.post('/:quizId/answer', authMiddleware, submitAnswer);
router.get('/:quizId/next', authMiddleware, getNextQuestion);
router.post('/:quizId/complete', authMiddleware, completeQuiz);

export default router;
