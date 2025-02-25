import { createTheme } from '@mui/material/styles';

const nordTheme = createTheme({
  palette: {
    mode: 'dark',
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
      secondary: '#E5E9F0',
    },
    action: {
      active: '#D8DEE9',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#3B4252',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#3B4252',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#434C5E',
        },
      },
    },
  },
});

export default nordTheme;

