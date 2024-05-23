import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios.post('http://localhost:5000/auth/login', { email: 'test@test.com', password: 'password' })
      .then(res => {
        const token = res.data.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserId(res.data.userId);
        socket.emit('join', { userId: res.data.userId });
      });

    socket.on('message', msg => {
      setMessages(prev => [...prev, msg]);
    });
  }, []);

  const sendMessage = () => {
    axios.post('http://localhost:5000/sendMessage', { receiver: 'someUserId', content: message })
      .then(() => setMessage(''));
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.sender}: {msg.content}</div>
        ))}
      </div>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
