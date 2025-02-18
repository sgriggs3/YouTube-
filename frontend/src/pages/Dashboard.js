import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent,
  Grid,
  TextField, 
  Button, 
  Typography,
  IconButton,
} from '@mui/material';
import { YouTube, History, TrendingUp, Settings } from '@mui/icons-material';
import api from '../services/api';

const Dashboard = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [realTimeComments, setRealTimeComments] = useState([]);
  const [exportFormat, setExportFormat] = useState('json');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.getProviders();
        setProviders(response);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');
    socket.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      setRealTimeComments((prevComments) => [...prevComments, newComment]);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (videoUrl && selectedProvider && selectedModel) {
      navigate(`/analysis/${encodeURIComponent(videoUrl)}?provider=${selectedProvider}&model=${selectedModel}`);
    }
  };

  const handleSearch = async () => {
    try {
      const comments = await api.searchComments(videoUrl, keyword);
      setRealTimeComments(comments);
    } catch (err) {
      console.error('Error searching comments:', err);
    }
  };

  const handleExport = async () => {
    try {
      await api.exportData(videoUrl, exportFormat);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const handleShare = async (platform) => {
    try {
      await api.shareAnalysis(videoUrl, platform);
    } catch (err) {
      console.error('Error sharing analysis:', err);
    }
  };

  const featuredCards = [
    { 
      title: 'Recent Analysis',
      icon: <History />,
      onClick: () => navigate('/history'),
    },
    {
      title: 'Trending Videos',
      icon: <TrendingUp />,
      onClick: () => navigate('/trending'),
    },
    {
      title: 'Settings',
      icon: <Settings />,
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <Box>
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Analyze YouTube Video Sentiment
          </Typography>
          <form onSubmit={handleAnalyze}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter YouTube Video URL or ID"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  InputProps={{
                    startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={!videoUrl || !selectedProvider || !selectedModel}
                >
                  Analyze Video
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  label="Select API Provider"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select API Provider</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  label="Select Model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Model</option>
                  {selectedProvider && providers[selectedProvider]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Advanced Search
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter keyword to search in comments"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          {realTimeComments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Filtered Comments</Typography>
              {realTimeComments.map((comment, index) => (
                <Typography key={index}>{comment.text}</Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Real-Time Comments
          </Typography>
          {realTimeComments.length > 0 ? (
            realTimeComments.map((comment, index) => (
              <Typography key={index}>{comment.text}</Typography>
            ))
          ) : (
            <Typography>No new comments yet...</Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                variant="outlined"
                select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleExport}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Share Analysis
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleShare('twitter')}
            sx={{ mr: 2 }}
          >
            Share on Twitter
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleShare('facebook')}
          >
            Share on Facebook
          </Button>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {featuredCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={card.onClick}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <IconButton 
                  color="primary"
                  sx={{ mb: 2, p: 2, bgcolor: 'primary.light' }}
                >
                  {card.icon}
                </IconButton>
                <Typography variant="h6">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
