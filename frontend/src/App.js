import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analysis from './pages/Analysis';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setTheme(parsedSettings.theme || 'light');
    }
  }, []);

  const themeConfig = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            <Route path="/analysis/:videoId?" element={<Analysis />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
