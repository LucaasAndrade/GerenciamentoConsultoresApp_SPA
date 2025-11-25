import { Router } from 'express';

export default (db) => {
    const router = Router();

    // Endpoint to install the table
    router.get('/install', (req, res) => {
        const tb_consultor = `
            CREATE TABLE IF NOT EXISTS tb_consultor(
                id_consultor    INTEGER PRIMARY KEY AUTOINCREMENT,
                nome            TEXT,
                email           TEXT,
                telefone        TEXT,
                area_atuacao    TEXT,
                data_criacao    DATE,
                ultimo_update   DATETIME
            );
        `;

        db.serialize(() => {
            db.run(tb_consultor, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Table 'tb_consultor' created or already exists." });
            });
        });
    });

    // Endpoint to get a consultant by ID
    router.get('/consultores/:id', (req, res) => {
        const { id } = req.params;
        db.get('SELECT * FROM tb_consultor WHERE id_consultor = ?', [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row);
        });
    });

    // Endpoint for filter by name
    router.get('/consultores/filtered/:nome', (req, res) => {
        const { nome } = req.params;
        db.get('SELECT * FROM tb_consultor WHERE nome like ?', [nome + "%"], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    });

    // Endpoint for paginated query of all consultants
    router.get('/consultores', (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        db.all('SELECT * FROM tb_consultor LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    });

    // Endpoint to add a new consultant
    router.post('/consultores', (req, res) => {
        const { nome, email, telefone, area_atuacao } = req.body;
        const data_criacao = new Date().toISOString().split('T')[0];
        const ultimo_update = new Date().toISOString();

        db.run(
            'INSERT INTO tb_consultor (nome, email, telefone, area_atuacao, data_criacao, ultimo_update) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, telefone, area_atuacao, data_criacao, ultimo_update],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json({ id: this.lastID });
            }
        );
    });

    // Endpoint to change a consultant
    router.put('/consultores/:id', (req, res) => {
        const { id } = req.params;
        const { nome, email, telefone, area_atuacao } = req.body;
        const ultimo_update = new Date().toISOString();

        db.run(
            'UPDATE tb_consultor SET nome = ?, email = ?, telefone = ?, area_atuacao = ?, ultimo_update = ? WHERE id_consultor = ?',
            [nome, email, telefone, area_atuacao, ultimo_update, id],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ changes: this.changes });
            }
        );
    });

    // Endpoint to delete a consultant
    router.delete('/consultores/:id', (req, res) => {
        const { id } = req.params;
        db.run('DELETE FROM tb_consultor WHERE id_consultor = ?', [id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ deleted: this.changes });
        });
    });

    return router;
};
