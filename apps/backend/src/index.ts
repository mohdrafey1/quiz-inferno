import express from 'express';
import dotenv from 'dotenv';
import { prismaClient } from '@repo/db/client';

dotenv.config();
const app = express();
app.use(express.json());

// Test API
app.get('/', (req, res) => {
    res.send('Quiz Platform API Running!');
});

// Get Users
app.get('/users', async (req, res) => {
    try {
        const users = await prismaClient.user.findMany();
        res.json({ users });
    } catch (error: any) {
        console.error('Prisma Error:', error.message, error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Create User
app.post('/create-user', async (req, res) => {
    try {
        const { username, email } = req.body;

        const newUser = await prismaClient.user.create({
            data: {
                username,
                email,
            },
        });

        res.json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
