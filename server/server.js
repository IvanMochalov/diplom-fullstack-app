import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация базы данных
const initializeDatabase = async () => {
    try {
        // Синхронизируем схему с БД
        await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
        console.log('✅ SQLite database initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
};

// API Routes

// GET - получить всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                posts: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET - получить пользователя по ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { posts: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST - создать пользователя
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email
            }
        });

        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST - создать пост для пользователя
app.post('/api/users/:userId/posts', async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, content } = req.body;

        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: parseInt(userId)
            }
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT - обновить пользователя
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email
            }
        });

        res.json(user);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE - удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Запуск сервера
app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 SQLite database ready`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});