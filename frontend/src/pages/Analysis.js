import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, TextField, Grid } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingState from '../components/LoadingState';
import SentimentChart from '../components/visualizations/SentimentChart';
import api from '../services/api';
import VideoMetadata from '../components/VideoMetadata';

const Analysis = () => {
  const { videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [filteredComments, setFilteredComments] = useState([]);
  const [realTimeComments, setRealTimeComments] = useState([]);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metadata, sentiment] = await Promise.all([
          api.getVideoMetadata(videoId),
          api.analyzeSentiment(videoId)
        ]);

        setData({ metadata, sentiment });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

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

  const handleSearch = async () => {
    try {
      const comments = await api.searchComments(videoId, keyword);
      setFilteredComments(comments);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    try {
      await api.exportData(videoId, exportFormat);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = async (platform) => {
    try {
      await api.shareAnalysis(videoId, platform);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingState message="Analyzing video..." />;
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Analysis Results
          </Typography>
          {data && (
            <>
              <SentimentChart data={data.sentiment} />
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Video Metadata
                </Typography>
                <VideoMetadata metadata={data.metadata} />
              </Paper>
              <Paper sx={{ p: 3, mb: 3 }}>
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
                {filteredComments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Filtered Comments</Typography>
                    {filteredComments.map((comment, index) => (
                      <Typography key={index}>{comment.text}</Typography>
                    ))}
                  </Box>
                )}
              </Paper>
              <Paper sx={{ p: 3, mb: 3 }}>
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
              </Paper>
              <Paper sx={{ p: 3, mb: 3 }}>
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
              </Paper>
              <Paper sx={{ p: 3, mb: 3 }}>
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
              </Paper>
            </>
          )}
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default Analysis;
