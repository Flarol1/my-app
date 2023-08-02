const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);



io.on('connection', (socket) => {
  socket.on('create', () => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    sessions[sessionId] = { users: [] };
    socket.join(sessionId);
    socket.emit('created', sessionId);
    console.log('session created')
  });

  socket.on('join', (sessionId) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
      socket.emit('joined', sessionId);
    } else {
      socket.emit('error', 'Session not found.');
    }
  });

  socket.on('submit-word', ({ sessionId, word }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].users.push({ socketId: socket.id, word });
      io.to(sessionId).emit('new-word', word); // Notify all connected clients
      console.log(word, 'submitted to', sessionId )
    }
  });
  socket.on('add-word', ({ sessionId, word }) => {
    if (sessions[sessionId]) {
      // Add the word to the session's users array
      sessions[sessionId].users.push({ socketId: socket.id, word });
      io.to(sessionId).emit('new-word', word); // Notify all connected clients
      console.log(word, 'added to', sessionId);
    } else {
      socket.emit('error', 'Session not found.');
    }
  });


});
const sessions = {};
// Store sessions in an object, with each session ID as a key
app.use(express.static('public'));

// Send session.html when accessing /session/:id
app.get('/session/:id', (req, res) => {
  res.sendFile(__dirname + '/public/session.html');
});

// Fetch values for a specific session
app.get('/session/:id/values', (req, res) => {
  const sessionId = req.params.id;
  console.log('Fetching values for session:', sessionId); // Log the session ID
  console.log('Current sessions:', sessions); // Log the entire sessions object

  if (sessions[sessionId]) {
    const words = sessions[sessionId].users.map(user => user.word);
    console.log('Words for this session:', words); // Log the words for this session
    res.json(words);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});


const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

