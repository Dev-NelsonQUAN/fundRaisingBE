import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB, db } from './config/database'; 

import { initSocket, broadcastLatestData } from './services/financialDataServices';
import { updateAmountIn, updateAmountOut, getLatestDataState } from './controllers/updateController'; 

const app: Express = express();
const PORT = process.env.PORT;
const server = http.createServer(app);

app.use(express.json()); 
app.use(cors<Request>({
    origin: '*', 
    methods: ['GET', 'POST']
}));

const io: SocketIOServer = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

initSocket(io);

app.get('/', (req: Request, res: Response) => {
    res.send(`Server is running. MongoDB status: ${db.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

app.get('/latest-data', getLatestDataState);

app.post('/update-amount-in', updateAmountIn);
app.post('/update-amount-out', updateAmountOut);


io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    broadcastLatestData();
    
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});



connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is successfully running`);
    });
});