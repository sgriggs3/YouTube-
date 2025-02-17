import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import ChatView from './webui/components/chat/ChatView';
import HistoryView from './webui/components/history/HistoryView';
import SettingsView from './webui/components/settings/SettingsView';
import WelcomeView from './webui/components/welcome/WelcomeView';
import { useExtensionState, ExtensionStateContextProvider } from './webui/context/ExtensionStateContext';
import { vscode } from './webui/utils/vscode';
import McpView from './webui/components/mcp/McpView';
import AnalysisView from './webui/components/analysis/AnalysisView';

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
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<WelcomeView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/mcp" element={<McpView />} />
            <Route path="/analysis" element={<AnalysisView metadata={metadata} sentiment={sentiment} />} />
          </Routes>
          <div>
            <h1>YouTube Sentiment Analysis</h1>
            <form onSubmit={(e) => {
              e.preventDefault();
              fetchVideoMetadata(videoId);
            }}>
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="Enter YouTube Video ID"
              />
              <button type="submit">Analyze</button>
            </form>
            {error && (
              <div style={{ color: 'red' }}>
                Error: {error}
              </div>
            )}
            {metadata && (
              <div>
                <h2>Video Metadata</h2>
                <pre>{JSON.stringify(metadata, null, 2)}</pre>
              </div>
            )}
            {sentiment && (
              <div>
                <h2>Sentiment Analysis</h2>
                <pre>{JSON.stringify(sentiment, null, 2)}</pre>
              </div>
            )}
          </div>
        </Container>
      </Router>
    </ExtensionStateContextProvider>
  );
};

export default App;
