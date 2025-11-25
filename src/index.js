import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consultorController from './controller/consultorController.js';
import authController from './controller/authController.js';
import client from './database/turso.js';

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

server.use('/api', consultorController);
server.use('/api', authController);

server.use('/api/ping', (_req, res) => {
    res.send({
        response: "pong"
    })
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor Express rodando na porta ${port}`);
});
