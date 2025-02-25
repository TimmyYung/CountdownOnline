const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const vowels = 'AEIOU';
const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', ({ roomCode, username }) => {
    socket.join(roomCode);
    socket.to(roomCode).emit('user_joined', { username, message: `${username} has joined the room` });

    // Send picked letters to the new user
    const roomLetters = rooms.get(roomCode) || [];
    socket.emit('letter_history', roomLetters);
  });

  socket.on('PICK', ({ roomCode, type }) => {
    const letterPool = type === 'vowel' ? vowels : consonants;
    const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];

    // Store the picked letter for the room
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, []);
    }
    rooms.get(roomCode).push({ type, letter: randomLetter });

    io.to(roomCode).emit('letter_picked', { type, letter: randomLetter });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Check which rooms the user was part of
    const userRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

    userRooms.forEach((roomCode) => {
      // Leave the room
      socket.leave(roomCode);

      // Check if there are any users left in the room
      const remainingUsers = io.sockets.adapter.rooms.get(roomCode)?.size || 0;

      if (remainingUsers === 0) {
        // If no users are left in the room, clear its data
        rooms.delete(roomCode); // Clear letter history for this room
        console.log(`Room ${roomCode} is now empty and has been deleted.`);
      }
    });
  });

    socket.on('set_timer', ({ roomCode, duration }) => {
    io.to(roomCode).emit('timer_set', { duration });
  });

  socket.on('start_timer', ({ roomCode }) => {
    io.to(roomCode).emit('timer_started');
  });

  socket.on('chat_message', ({ roomCode, username, message }) => {
    io.to(roomCode).emit('message_received', {
      type: 'USER',
      username: username,
      message: message,
      timestamp: new Date().toISOString()
    });
  });

});

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
