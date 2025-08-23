import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Note } from "./entity/Note";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.put("/api/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const repo = AppDataSource.getRepository(Note);
    const note = await repo.findOneBy({ id: id });

    if (!note) {
      return res.status(404).json({ error: "Nota não encontrada." });
    }

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.tags = Array.isArray(tags) ? tags.map(String) : note.tags;

    const updated = await repo.save(note);
    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar nota." });
  }
});

app.post("/api/notes/new", async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body || {};

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "title e content são obrigatórios." });
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
    return res.status(500).json({ error: "Erro ao criar nota." });
  }
});

app.delete("/api/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repo = AppDataSource.getRepository(Note);
    const note = await repo.findOneBy({ id });

    if (!note) {
      return res.status(404).json({ error: "Nota não encontrada." });
    }

    await repo.remove(note);
    return res.status(204).send(); // sem conteúdo
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar nota." });
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
    console.error("Erro ao inicializar DataSource:", err);
    process.exit(1);
  });
