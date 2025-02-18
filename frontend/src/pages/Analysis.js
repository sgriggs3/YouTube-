import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box } from '@mui/material';
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
            </>
          )}
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default Analysis;
