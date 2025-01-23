const { Server } = require('socket.io');

let io;
let userSockets = {};

function init(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-room', (roomId) => {
            console.log(`User ${socket.id} joined room: ${roomId}`);
            socket.join(roomId);
        });

        socket.on('register', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} registered with socket ID: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });

        userSockets[socket.id] = socket;
    });
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = { init, getIo };
