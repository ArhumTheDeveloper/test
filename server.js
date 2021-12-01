var socket = require("socket.io");
var http = require("http");
const server = require('http').Server();
const express = require('express');
const app = express();
const io = (socket)(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {

  debug: false,

  });

app.use("/peerjs", peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room});
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

http.createServer(app).listen(3000);