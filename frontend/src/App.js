import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, TextField, Paper, Grid } from '@mui/material';
import ChatView from './webui/components/chat/ChatView';
import HistoryView from './webui/components/history/HistoryView';
import SettingsView from './webui/components/settings/SettingsView';
import WelcomeView from './webui/components/welcome/WelcomeView';
import { useExtensionState, ExtensionStateContextProvider } from './webui/context/ExtensionStateContext';
import { vscode } from './webui/utils/vscode';
import McpView from './webui/components/mcp/McpView';
import AnalysisView from './webui/components/analysis/AnalysisView';
import VideoInputPage from './pages/VideoInputPage';
import MetadataPage from './pages/MetadataPage';
import SentimentAnalysisPage from './pages/SentimentAnalysisPage';
import DataVisualizationPage from './pages/DataVisualizationPage';

// Configure the backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const App = () => {
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [videoId, setVideoId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState(null);
  const { didHydrateState, showWelcome, shouldShowAnnouncement } = useExtensionState();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMcp, setShowMcp] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const handleMessage = useCallback((e) => {
    const message = e.data;
    switch (message.type) {
      case "action":
        switch (message.action) {
          case "settingsButtonClicked":
            setShowSettings(true);
            setShowHistory(false);
            setShowMcp(false);
            break;
          case "historyButtonClicked":
            setShowSettings(false);
            setShowHistory(true);
            setShowMcp(false);
            break;
          case "mcpButtonClicked":
            setShowSettings(false);
            setShowHistory(false);
            setShowMcp(true);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const fetchVideoMetadata = async (videoId) => {
    try {
      const metaRes = await fetch(`${BACKEND_URL}/api/video-metadata/${videoId}`);
      if (!metaRes.ok) throw new Error(`Failed to fetch metadata: ${metaRes.status}`);
      const metaData = await metaRes.json();
      setMetadata(metaData);

      const sentRes = await fetch(`${BACKEND_URL}/api/sentiment-analysis?urlOrVideoId=${videoId}`);
      if (!sentRes.ok) throw new Error(`Failed to fetch sentiment: ${sentRes.status}`);
      const sentData = await sentRes.json();
      setSentiment(sentData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setMetadata(null);
      setSentiment(null);
    }
  };

  if (!didHydrateState) return null;

  return (
    <ExtensionStateContextProvider>
      <Router>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              YouTube Insight Analyzer
            </Typography>
            <Button color="inherit" component={Link} to="/settings">
              Settings
            </Button>
            <Button color="inherit" component={Link} to="/analysis">
              Analysis
            </Button>
            <Button color="inherit" component={Link} to="/video-input">
              Video Input
            </Button>
            <Button color="inherit" component={Link} to="/metadata">
              Metadata
            </Button>
            <Button color="inherit" component={Link} to="/sentiment-analysis">
              Sentiment Analysis
            </Button>
            <Button color="inherit" component={Link} to="/data-visualization">
              Data Visualization
            </Button>
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<WelcomeView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/mcp" element={<McpView />} />
            <Route path="/analysis" element={<AnalysisView metadata={metadata} sentiment={sentiment} />} />
            <Route path="/video-input" element={<VideoInputPage />} />
            <Route path="/metadata" element={<MetadataPage />} />
            <Route path="/sentiment-analysis" element={<SentimentAnalysisPage />} />
            <Route path="/data-visualization" element={<DataVisualizationPage />} />
          </Routes>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
              YouTube Sentiment Analysis
            </Typography>
            <form onSubmit={(e) => {
              e.preventDefault();
              fetchVideoMetadata(videoId);
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Enter YouTube Video ID"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Analyze
                  </Button>
                </Grid>
              </Grid>
            </form>
            {error && (
              <Typography color="error" variant="body2" style={{ marginTop: '10px' }}>
                Error: {error}
              </Typography>
            )}
            {metadata && (
              <div style={{ marginTop: '20px' }}>
                <Typography variant="h5">Video Metadata</Typography>
                <pre>{JSON.stringify(metadata, null, 2)}</pre>
              </div>
            )}
            {sentiment && (
              <div style={{ marginTop: '20px' }}>
                <Typography variant="h5">Sentiment Analysis</Typography>
                <pre>{JSON.stringify(sentiment, null, 2)}</pre>
              </div>
            )}
          </Paper>
        </Container>
      </Router>
    </ExtensionStateContextProvider>
  );
};

export default App;
