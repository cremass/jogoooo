const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  // Criar novo jogador
  players[socket.id] = { x: 100, y: 100, color: getRandomColor() };

  // Enviar dados do novo jogador para todos
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  // Quando jogador se move
  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('playerMoved', { id: socket.id, x: data.x, y: data.y });
    }
  });

  // Desconectar jogador
  socket.on('disconnect', () => {
    console.log('Jogador saiu:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

http.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});