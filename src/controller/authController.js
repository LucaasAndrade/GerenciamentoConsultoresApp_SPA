import { Router } from 'express';

export default (db) => {
    const router = Router();

    // Endpoint to install the table
    router.get('/install/auth', (req, res) => {
        const tb_auth = `  
            CREATE TABLE IF NOT EXISTS tb_admin(
                id_admin        INTEGER PRIMARY KEY AUTOINCREMENT,
                login           TEXT,
                password        TEXT,
                data_criacao    DATE,
                ultimo_update   DATETIME
            );

            INSERT INTO tb_admin(login, password, data_criacao) 
                VALUES("root", "root", "10-10-2000");
        `;

        db.serialize(() => {
            db.run(tb_auth, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Table 'tb_auth' created or already exists." });
            });
        });
    });

    // Endpoint to get a consultant for login
    router.post('/admin/login', (req, res) => {
        const { login, password } = req.body;
        console.log("passei")
        db.get('SELECT id_admin, login, password FROM tb_admin WHERE login = ? AND password = ?', [login, password], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row);
        });
    });

    // Endpoint for paginated query of all consultants
    router.get('/admin', (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        db.all('SELECT * FROM tb_admin LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    });

    // Endpoint to add a new consultant
    router.post('/admin', (req, res) => {
        const { login, password } = req.body;
        const data_criacao = new Date().toISOString().split('T')[0];
        const ultimo_update = new Date().toISOString();

        db.run(
            'INSERT INTO tb_admin (login, password, data_criacao, ultimo_update) VALUES (?, ?, ?, ?)',
            [login, password, data_criacao, ultimo_update],
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
    router.put('/admin/:id', (req, res) => {
        const { id } = req.params;
        const { login, password } = req.body;
        const ultimo_update = new Date().toISOString();

        db.run(
            'UPDATE tb_admin SET login = ?, password = ?, ultimo_update = ? WHERE id_admin = ?',
            [login, password, ultimo_update, id],
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
    router.delete('/admin/:id', (req, res) => {
        const { id } = req.params;
        db.run('DELETE FROM tb_admin WHERE id_admin = ?', [id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ deleted: this.changes });
        });
    });

    return router;
};
