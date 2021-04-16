const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = []

const socketToRoom = {}

if(process.env.NODE_ENV == "production") {
    app.use(express.static("client/build"))
}

io.on('connection', socket => {
    socket.on("join room", roomID => {
        users.push(socket.id)
        socket.emit("all users", users);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("sending audio signal", payload => {
        io.to(payload.userToSignal).emit('user joined audio', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning audio signal", payload => {
        io.to(payload.callerID).emit('receiving returned audio signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });
});

server.listen(process.env.PORT || 4000)