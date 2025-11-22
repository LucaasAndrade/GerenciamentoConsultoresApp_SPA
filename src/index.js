import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import consultorController from './controller/consultorController.js';
import authController from './controller/authController.js';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3030;
const DB_PATH = './src/database/mydb.sqlite';

server.use(cors());
server.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
    if(err){
        console.log("Falaha ao conectar no banco de dados")
    }
    console.log("Conectado com sucesso ao banco de dados.")
});

server.use('/api', consultorController(db));
server.use('/api', authController(db));

server.use('/api/ping', (_req, res) => {
    res.send({
        response: "pong"
    })
})


server.listen(PORT, 
    () => console.log("API ONLINE >> PORTA " + PORT)
);

process.on('SIGINT', () => {
    db.close(() => {
        console.log("Finalizando conexão com db");
        process.exit();
    })
})
