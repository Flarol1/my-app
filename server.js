const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


io.on('connection', (socket) => {
  socket.on('create', () => {
    const words = ['Jon', 'Andy', 'Tom', 'Dylan', 'Scotty', 'Gunnar', 'Cameron', 'Anthony',' Zack', 'Ren'];
    const sessionId = words[Math.floor(Math.random() * words.length)];
    sessions[sessionId] = { users: [] };
    socket.join(sessionId);
    socket.emit('created', sessionId);
    console.log('session created')
  });

  socket.on('join', (sessionId) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
      socket.emit('joined', sessionId);
       // Picking a random value

       
    socket.on('pick-random-value', (randomValue) => {
      io.to(sessionId).emit('random-value-picked', randomValue);
    });
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
  socket.on('clear-words', ({ sessionId }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].users = []; // Clear the users (words) for this session
      io.to(sessionId).emit('words-cleared'); // Notify all connected clients
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
  res.sendFile(__dirname + '/session.html');
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

