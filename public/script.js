const socket = io();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let players = {};
let me = null;
const speed = 5;

// Recebe todos os jogadores ao conectar
socket.on('currentPlayers', (serverPlayers) => {
  players = serverPlayers;
  me = players[socket.id];
});

// Novo jogador entra
socket.on('newPlayer', (player) => {
  players[player.id] = player;
});

// Jogador se move
socket.on('playerMoved', (data) => {
  if (players[data.id]) {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
  }
});

// Jogador desconecta
socket.on('playerDisconnected', (id) => {
  delete players[id];
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 30, 30);
  }
}

function update() {
  if (!me) return;

  let moved = false;
  if (keys.ArrowUp) { me.y -= speed; moved = true; }
  if (keys.ArrowDown) { me.y += speed; moved = true; }
  if (keys.ArrowLeft) { me.x -= speed; moved = true; }
  if (keys.ArrowRight) { me.x += speed; moved = true; }

  if (moved) {
    socket.emit('move', { x: me.x, y: me.y });
  }
}

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}