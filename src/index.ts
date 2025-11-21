import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { Note } from './entity/Note';
import * as dotenv from 'dotenv';
import { Like } from 'typeorm';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true // Allow sending cookies and other credentials
    }));
app.use(express.json());

// healthcheck
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});



app.put('/api/notes/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;

        const repo = AppDataSource.getRepository(Note);
        const note = await repo.findOneBy({ id: id });

        if (!note) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }

        note.title = title ?? note.title;
        note.content = content ?? note.content;
        note.tags = Array.isArray(tags) ? tags.map(String) : note.tags;

        const updated = await repo.save(note);
        return res.json(updated);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar nota.' });
    }
});

app.post('/api/notes/new', async (req: Request, res: Response) => {
    try {
        const { title, content, tags } = req.body || {};

        if (!title || !content) {
            return res.status(400).json({ error: 'title e content são obrigatórios.' });
        }

        const repo = AppDataSource.getRepository(Note);
        const note = repo.create({
            title: String(title),
            content: String(content),
            tags: Array.isArray(tags) ? tags.map(String) : null,
        });

        const saved = await repo.save(note);
        return res.status(201).json(saved);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao criar nota.' });
    }
});

app.delete('/api/notes/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const repo = AppDataSource.getRepository(Note);
        const note = await repo.findOneBy({ id });

        if (!note) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }

        await repo.remove(note);
        return res.status(204).send();
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao deletar nota.' });
    }
});

app.get('/api/notes', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const q   = (req.query.q   as string | undefined)?.trim();
    const tag = (req.query.tag as string | undefined)?.trim();

    const repo = AppDataSource.getRepository(Note);
    const qb = repo.createQueryBuilder('n');

    if (q) qb.andWhere('(n.title ILIKE :q OR n.content ILIKE :q)', { q: `%${q}%` });

    if (tag) {
      // se você normaliza as tags para lowercase no POST/PUT, normalize aqui também:
      const t = tag.toLowerCase();
      qb.andWhere('n.tags IS NOT NULL AND :t = ANY(n.tags)', { t });
    }

    const [data, total] = await Promise.all([
      qb.orderBy('n.created_at', 'DESC').skip(skip).take(limit).getMany(), // ou 'n.createdAt'
      qb.getCount(),
    ]);

    return res.json({
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: skip + data.length < total },
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar notas.' });
  }
});



const port = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

AppDataSource.initialize()
    .then(() => {
        app.listen(port, HOST, () => {
            console.log(`API rodando em http://${HOST}:${port}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao inicializar DataSource:', err);
        process.exit(1);
    });
