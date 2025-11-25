import { Router } from 'express';
import client from '../database/turso.js';

const router = Router();

// Endpoint to get a consultant for login
router.post('/admin/login', async (req, res) => {
    const { login, password } = req.body;
    
    try {
        const rs = await client.execute({
            sql: 'SELECT id_admin, login FROM tb_admin WHERE login = ? AND password = ?', 
            args: [login, password]
        });
        
        if (rs.rows.length > 0) {
            res.json({ message: "Login successful", user: rs.rows[0] });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for paginated query of all consultants
router.get('/admin', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const rs = await client.execute({
            sql: 'SELECT id_admin, login, data_criacao, ultimo_update FROM tb_admin LIMIT ? OFFSET ?',
            args: [limit, offset]
        });
        res.json(rs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to add a new consultant
router.post('/admin', async (req, res) => {
    const { login, password } = req.body;
    const data_criacao = new Date().toISOString().split('T')[0];
    const ultimo_update = new Date().toISOString();

    try {
        const rs = await client.execute({
            sql: 'INSERT INTO tb_admin (login, password, data_criacao, ultimo_update) VALUES (?, ?, ?, ?)',
            args: [login, password, data_criacao, ultimo_update]
        });
        res.status(201).json({ message: "Admin criado com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to change a consultant
router.put('/admin/:id', async (req, res) => {
    const { id } = req.params;
    const { login, password } = req.body;
    const ultimo_update = new Date().toISOString();

    try {
        const rs = await client.execute({
            sql: 'UPDATE tb_admin SET login = ?, password = ?, ultimo_update = ? WHERE id_admin = ?',
            args: [login, password, ultimo_update, id]
        });
        res.json({ changes: rs.rowsAffected });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to delete a consultant
router.delete('/admin/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rs = await client.execute({
            sql: 'DELETE FROM tb_admin WHERE id_admin = ?',
            args: [id]
        });
        res.json({ deleted: rs.rowsAffected });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
