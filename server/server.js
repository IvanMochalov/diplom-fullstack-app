import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello from Vite + Express!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/data', (req, res) => {
    console.log('Received data:', req.body);
    res.json({ status: 'Data received!', received: req.body });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});