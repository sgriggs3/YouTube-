import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { CustomThemeContext } from '../../ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = () => {
  const { currentTheme, setTheme } = useContext(CustomThemeContext);

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            YouTube Insight Analyzer
          </Link>
        </Typography>
        <Button color="inherit" component={Link} to="/analysis">
          Analysis
        </Button>
        <Button color="inherit" component={Link} to="/settings">
          Settings
        </Button>
        <IconButton sx={{ ml: 1 }} color="inherit" onClick={toggleTheme}>
          {currentTheme === 'light' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
