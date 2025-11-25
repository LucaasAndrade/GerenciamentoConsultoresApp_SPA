import { Router } from 'express';
import client from '../database/turso.js';

const router = Router();


// Endpoint to get a consultant by ID
router.get('/consultores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rs = await client.execute({
            sql: 'SELECT * FROM tb_consultor WHERE id_consultor = ?',
            args: [id]
        });
        res.json(rs.rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for filter by name
router.get('/consultores/filtered/:nome', async (req, res) => {
    const { nome } = req.params;
    try {
        const rs = await client.execute({
            sql: 'SELECT * FROM tb_consultor WHERE nome like ?',
            args: [nome + "%"]
        });
        res.json(rs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for paginated query of all consultants
router.get('/consultores', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const rs = await client.execute({
            sql: 'SELECT * FROM tb_consultor LIMIT ? OFFSET ?',
            args: [limit, offset]
        });
        res.json(rs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to add a new consultant
router.post('/consultores', async (req, res) => {
    const { nome, email, telefone, area_atuacao } = req.body;
    const data_criacao = new Date().toISOString().split('T')[0];
    const ultimo_update = new Date().toISOString();

    try {
        const rs = await client.execute({
            sql: 'INSERT INTO tb_consultor (nome, email, telefone, area_atuacao, data_criacao, ultimo_update) VALUES (?, ?, ?, ?, ?, ?)',
            args: [nome, email, telefone, area_atuacao, data_criacao, ultimo_update]
        });
        res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to change a consultant
router.put('/consultores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, area_atuacao } = req.body;
    const ultimo_update = new Date().toISOString();

    try {
        const rs = await client.execute({
            sql: 'UPDATE tb_consultor SET nome = ?, email = ?, telefone = ?, area_atuacao = ?, ultimo_update = ? WHERE id_consultor = ?',
            args: [nome, email, telefone, area_atuacao, ultimo_update, id]
        });
        res.json({ changes: rs.rowsAffected });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to delete a consultant
router.delete('/consultores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rs = await client.execute({
            sql: 'DELETE FROM tb_consultor WHERE id_consultor = ?',
            args: [id]
        });
        res.json({ deleted: rs.rowsAffected });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
