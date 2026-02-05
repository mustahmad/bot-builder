import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log(`PORT=${PORT}, DATABASE_URL=${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// В продакшене раздаём собранный фронтенд
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — все не-API маршруты возвращают index.html
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
