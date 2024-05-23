const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const setupSocket = require('./socket');

app.use('/auth', authRoutes);
setupSocket(io);

app.post('/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  await User.findByIdAndUpdate(req.user.userId, { status });
  res.send('Status updated');
});

app.post('/sendMessage', authMiddleware, async (req, res) => {
  const { receiver, content } = req.body;
  const sender = req.user.userId;
  const recipient = await User.findById(receiver);
  if (recipient.status === 'BUSY') {
    const response = await getLLMResponse(content);
    return res.send({ sender: 'System', content: response });
  }
  io.to(receiver).emit('message', { sender, content });
  res.send('Message sent');
});

async function getLLMResponse(prompt) {
  return new Promise((resolve) => {
    const timeout = Math.random() * (15000 - 5000) + 5000;
    setTimeout(() => {
      resolve('This is a mock response from the LLM based on user input');
    }, timeout);
  });
}
