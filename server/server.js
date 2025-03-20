const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

const messages = [];

app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', (req, res) => {
    const message = {
        id: Date.now(),
        content: req.body.content,
        sender: req.body.sender,
        timestamp: new Date().toISOString()
    };

    messages.push(message);

    io.emit('new_message', message);

    res.status(201).json(message);
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.emit('initial_messages', messages);


    socket.on('send_message', (message) => {
        const newMessage = {
            id: Date.now(),
            content: message.content,
            sender: message.sender,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);

        io.emit('new_message', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
