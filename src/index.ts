import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { Note } from './entity/Note';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// healthcheck
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// POST /api/notes/new
// body esperado:
// {
//   "title": "Minha nota",
//   "content": "Texto da nota",
//   "tags": ["trabalho", "ideias"] // opcional
// }
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
      tags: Array.isArray(tags) ? tags.map(String) : null
    });

    const saved = await repo.save(note);
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar nota.' });
  }
});

const port = Number(process.env.PORT || 3000);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`API rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao inicializar DataSource:', err);
    process.exit(1);
  });
