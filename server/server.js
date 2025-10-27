import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Функция для генерации случайных температурных данных за вчерашний день
const generateYesterdayData = async () => {
    try {
        // Проверяем, есть ли уже данные за вчера
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const existingData = await prisma.temperature.findFirst({
            where: {
                timestamp: {
                    gte: yesterday
                }
            }
        });

        // Если данных нет - генерируем
        if (!existingData) {
            console.log('🌡️ Generating temperature data for yesterday...');

            const temperatures = [];
            const startTime = new Date(yesterday);

            // Генерируем данные за каждую минуту вчерашнего дня
            for (let minute = 0; minute < 24 * 60; minute++) {
                const timestamp = new Date(startTime);
                timestamp.setMinutes(minute);

                // Случайная температура от 40 до 60 градусов
                const temperatureValue = 40 + Math.random() * 20;

                temperatures.push({
                    value: parseFloat(temperatureValue.toFixed(1)),
                    timestamp: timestamp
                });
            }

            // Сохраняем все данные разом
            await prisma.temperature.createMany({
                data: temperatures
            });

            console.log(`✅ Generated ${temperatures.length} temperature records`);
        }
    } catch (error) {
        console.error('Error generating temperature data:', error);
    }
};

// Инициализация базы данных
const initializeDatabase = async () => {
    try {
        await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
        await generateYesterdayData();
        console.log('✅ SQLite database initialized with temperature data');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
};

// API Routes

// GET - получить температуру за конкретный день
app.get('/api/temperatures/:date', async (req, res) => {
    try {
        const { date } = req.params; // формат: YYYY-MM-DD

        // Создаем диапазон дат для запроса
        const startDate = new Date(date + 'T00:00:00');
        const endDate = new Date(date + 'T23:59:59');

        const temperatures = await prisma.temperature.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        res.json({
            date: date,
            count: temperatures.length,
            data: temperatures
        });

    } catch (error) {
        console.error('Error fetching temperatures:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET - получить последние N записей температуры
app.get('/api/temperatures', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        const temperatures = await prisma.temperature.findMany({
            orderBy: {
                timestamp: 'desc'
            },
            take: limit
        });

        res.json(temperatures.reverse()); // возвращаем в хронологическом порядке
    } catch (error) {
        console.error('Error fetching temperatures:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST - добавить новое измерение температуры
app.post('/api/temperatures', async (req, res) => {
    try {
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({ error: 'Temperature value is required' });
        }

        const temperature = await prisma.temperature.create({
            data: {
                value: parseFloat(value)
            }
        });

        res.status(201).json(temperature);
    } catch (error) {
        console.error('Error creating temperature record:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET - получить статистику за день
app.get('/api/stats/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date + 'T00:00:00');
        const endDate = new Date(date + 'T23:59:59');

        const temperatures = await prisma.temperature.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        if (temperatures.length === 0) {
            return res.status(404).json({ error: 'No data for this date' });
        }

        const values = temperatures.map(t => t.value);
        const stats = {
            date: date,
            count: temperatures.length,
            average: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
            min: Math.min(...values),
            max: Math.max(...values),
            firstRecord: temperatures[0],
            lastRecord: temperatures[temperatures.length - 1]
        };

        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Запуск сервера
app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌡️ Temperature monitoring app ready`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});