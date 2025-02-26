import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/AuthRoute';
import userRoutes from './routes/userRoutes';
import quizRoutes from './routes/frontend/quizRoutes';

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/quiz', quizRoutes);

app.get('/', (req, res) => {
    res.send('Quiz Platform API Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
