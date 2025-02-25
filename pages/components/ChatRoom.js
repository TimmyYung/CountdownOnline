import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Button,
  Typography,
  Paper,
  Box,
  ThemeProvider,
  createTheme,
  TextField,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import io from 'socket.io-client';

// Nord theme colors
const nordTheme = createTheme({
  palette: {
    primary: {
      main: '#88C0D0',
      light: '#8FBCBB',
      dark: '#5E81AC',
    },
    secondary: {
      main: '#81A1C1',
    },
    background: {
      default: '#2E3440',
      paper: '#3B4252',
    },
    text: {
      primary: '#ECEFF4',
      secondary: '#D8DEE9',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default function ChatRoom({ username, roomCode, messages, sendMessage }) {
  const [letters, setLetters] = useState([]);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showRoomCode, setShowRoomCode] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const timerRef = useRef(null);
  const [consonantCount, setConsonantCount] = useState(0);
  const [vowelCount, setVowelCount] = useState(0);
  const [isTextBoxEnabled, setIsTextBoxEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSendMessage = () => {
    if (chatMessage.trim() !== '') {
      sendMessage({
        type: 'USER',
        username: username,
        message: chatMessage.trim()
      });
      setChatMessage('');
    }
  };
  
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    socketRef.current.emit('join_room', { roomCode, username });

    socketRef.current.on('letter_history', (letterHistory) => {
      setLetters(letterHistory.map(item => item.letter));
    });

    socketRef.current.on('letter_picked', ({ type, letter }) => {
      setLetters(prevLetters => [...prevLetters, letter]);
      if (type === 'consonant') {
        setConsonantCount(prev => prev + 1);
      } else {
        setVowelCount(prev => prev + 1);
      }
      sendMessage({ type: 'SYSTEM', message: `${type.toUpperCase()} picked: ${letter}` });
    });

    socketRef.current.on('timer_set', ({ duration }) => {
      setTimerDuration(duration);
      setTimeLeft(duration);
    });

    socketRef.current.on('timer_started', () => {
      startTimer();
      setIsTextBoxEnabled(false); // Disable text box when timer starts
    });
  
    return () => socketRef.current.disconnect();
  }, [roomCode, username, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const pickLetter = (type) => {
    if (letters.length < 9 && isValidPick(type)) {
      socketRef.current.emit('PICK', { roomCode, type });
    }
  };

  const isValidPick = (type) => {
    if (type === 'consonant' && consonantCount < 4) return true;
    if (type === 'vowel' && vowelCount < 3) return true;
    if (type === 'consonant' && consonantCount >= 4 && vowelCount < 3) return false;
    if (type === 'vowel' && vowelCount >= 3 && consonantCount < 4) return false;
    return letters.length < 9;
  };

  const setTimer = () => {
    socketRef.current.emit('set_timer', { roomCode, duration: timerDuration });
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(timerDuration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setIsTextBoxEnabled(true); // Enable text box when timer reaches 0
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleStartTimer = () => {
    socketRef.current.emit('start_timer', { roomCode });
  };

  return (
    <ThemeProvider theme={nordTheme}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Room Code: {showRoomCode ? roomCode : '****'}
            <IconButton onClick={() => setShowRoomCode(!showRoomCode)} sx={{ color: 'text.secondary' }}>
              {showRoomCode ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Typography>
          <Typography variant="h4">Countdown Game ({username})</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Selected Letters</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {letters.map((letter, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 1, minWidth: '30px', textAlign: 'center', bgcolor: '#ECEFF4' }}>
                <Typography variant="h5" sx={{ color: '#2E3440' }}>{letter}</Typography>
              </Paper>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  onClick={() => pickLetter('consonant')}
                  disabled={letters.length >= 9}
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: 'secondary.main',
                    color: letters.length >= 9 ? 'gray' : 'black',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                    '&.Mui-disabled': {
                      color: 'gray',
                    },
                  }}
                >
                  Pick Consonant
                </Button>
                <Button
                  onClick={() => pickLetter('vowel')}
                  disabled={letters.length >= 9}
                  sx={{
                    px: 3,
                    py: 1,
                    bgcolor: 'primary.main',
                    color: letters.length >= 9 ? 'gray' : 'black',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      color: 'gray',
                    },
                  }}
                >
                  Pick Vowel
                </Button>
              </Box>
              <Typography variant="h6" gutterBottom>Timer Controls</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  type="number"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Math.max(1, parseInt(e.target.value)))}
                  sx={{ width: '150px' }}
                />
                <Button onClick={setTimer} variant="contained" color="primary">Set Timer</Button>
                <Button onClick={handleStartTimer} variant="contained" color="secondary">Start Timer</Button>
              </Box>
              {timeLeft !== null && (
                <Typography variant="h4" align="center">
                  {formatTime(timeLeft)}
                </Typography>
              )}
            </Paper>
          </Box>
          <Box sx={{ width: '300px' }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Chat</Typography>
                <Box sx={{ height: '300px', overflowY: 'auto', mb: 2, p: 2 }}>
                  {messages.map((msg, index) => (
                    <Typography 
                      key={index} 
                      component="div"
                      sx={{ 
                        mb: 1,
                        color: msg.type === 'SYSTEM' ? 'secondary.main' : 'text.primary'
                      }}
                    >
                      <strong>{msg.type === 'SYSTEM' ? 'System' : msg.username}:</strong> {msg.message}
                    </Typography>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={!isTextBoxEnabled}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!isTextBoxEnabled}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}  