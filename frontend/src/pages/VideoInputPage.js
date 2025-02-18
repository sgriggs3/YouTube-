import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Grid } from '@mui/material';

const VideoInputPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`/api/video-metadata/${videoUrl}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video metadata');
      }
      const data = await response.json();
      setMetadata(data);
    } catch (err) {
      setError(err.message);
      setMetadata(null);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Enter YouTube Video URL
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                variant="outlined"
                label="YouTube Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Fetch Metadata
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
      </Paper>
    </Container>
  );
};

export default VideoInputPage;
