import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';

const VideoInput = ({ onSubmit }) => {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(videoUrl);
  };

  return (
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
  );
};

export default VideoInput;
