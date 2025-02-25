'use client'

import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import nordTheme from '/theme/nordTheme';
import ChatRoom from './components/ChatRoom';
import JoinRoom from './components/JoinRoom';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);

  const joinRoom = (enteredUsername, enteredRoomCode) => {
    if (!enteredUsername || !enteredRoomCode) {
      alert('Please enter both username and room code');
      return;
    }
    setUsername(enteredUsername);
    setRoomCode(enteredRoomCode);
    setIsInRoom(true);
  };

  const sendMessage = ({ type, message }) => {
    if (type === 'PICK') {
      // Handle PICK event
      setMessages(prev => [...prev, { text: `PICK:${message}`, username }]);
    } else {
      // Handle regular messages
      if (!message || !message.trim()) return;
      setMessages(prev => [...prev, { text: message, username }]);
    }
  };
  

  return (
    <ThemeProvider theme={nordTheme}>
      <CssBaseline />
      {isInRoom ? (
        <ChatRoom
          username={username}
          roomCode={roomCode}
          messages={messages}
          sendMessage={sendMessage}
        />
      ) : (
        <JoinRoom joinRoom={joinRoom} />
      )}
    </ThemeProvider>
  );
}

