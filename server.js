const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// 1. Home Page: Automatically creates a unique room ID and sends you there
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// 2. Room Page: Loads the video call interface
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// 3. Signaling: Tells other users in the room that you joined
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

server.listen(process.env.PORT || 3000);
