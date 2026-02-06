import { Router } from 'express';
import { prisma } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// GET /api/projects — список проектов пользователя
router.get('/', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const projects = await prisma.project.findMany({
      where: { userId: authReq.user!.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        nodes: true,
        edges: true,
        botToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ projects });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/projects — создать проект
router.post('/', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { name } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name || 'Новый бот',
        userId: authReq.user!.userId,
      },
      select: {
        id: true,
        name: true,
        nodes: true,
        edges: true,
        botToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/projects/:id — обновить проект (имя, nodes, edges)
router.put('/:id', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { name, nodes, edges, botToken } = req.body;

    // Проверяем, что проект принадлежит пользователю
    const existing = await prisma.project.findFirst({
      where: { id, userId: authReq.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Проект не найден' });
      return;
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (nodes !== undefined) data.nodes = nodes;
    if (edges !== undefined) data.edges = edges;
    if (botToken !== undefined) data.botToken = botToken;

    const project = await prisma.project.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        nodes: true,
        edges: true,
        botToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/projects/:id — удалить проект
router.delete('/:id', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const existing = await prisma.project.findFirst({
      where: { id, userId: authReq.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Проект не найден' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
