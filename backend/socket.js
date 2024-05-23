const Message = require('./models/Message');
module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });

    socket.on('sendMessage', async ({ sender, receiver, content }) => {
      const message = new Message({ sender, receiver, content });
      await message.save();
      io.to(receiver).emit('message', { sender, content });
    });
  });
};
