import express, { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
    addQuiz,
    completeQuiz,
    confirmPayment,
    getNextQuestion,
    quizResult,
    startQuiz,
    submitAnswer,
} from '../../controllers/frontend/quizController';

const router: Router = express.Router();

// POST /api/quiz - Create a new quiz
router.post('/', authMiddleware, addQuiz);

router.get('/:quizId/start', authMiddleware, startQuiz);
router.post('/:quizId/answer', authMiddleware, submitAnswer);
router.get('/:quizId/next', authMiddleware, getNextQuestion);
router.post('/:quizId/complete', authMiddleware, completeQuiz);

router.post('/pay', authMiddleware, confirmPayment);

router.get('/results/:quizId', authMiddleware, quizResult);

module.exports = router;

export default router;
