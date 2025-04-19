const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

let players = {};

app.get('/', (req, res) => res.send('Servidor Socket.IO ativo!'));

io.on('connection', (socket) => {
  console.log('Conectado:', socket.id);
  players[socket.id] = { x: 100, y: 100, color: getRandomColor() };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));