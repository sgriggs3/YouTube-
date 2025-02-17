import React, { useState } from 'react';
import { Container, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import VideoInput from './VideoInput';
import VideoDisplay from './VideoDisplay';
import CommentsDisplay from './CommentsDisplay';

function App() {
  const [videoData, setVideoData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);

  const handleVideoSubmit = async (videoId) => {
    try {
      const videoResponse = await fetch(`/api/video?videoId=${videoId}`);
      const videoResult = await videoResponse.json();
      if (videoResponse.ok) {
        setVideoData(videoResult);
      } else {
        console.error('Error fetching video data:', videoResult.error);
        // Handle error (e.g., display an error message to the user)
      }

      const commentsResponse = await fetch(`/api/comments?videoId=${videoId}`);
      const commentsResult = await commentsResponse.json();
      if (commentsResponse.ok) {
        setCommentsData(commentsResult);
      } else {
        console.error('Error fetching comments data:', commentsResult.error);
        // Handle error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error
    }
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        YouTube Sentiment Analysis
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <VideoInput onVideoSubmit={handleVideoSubmit} />
        {videoData && <VideoDisplay videoData={videoData} />}
        {commentsData && <CommentsDisplay comments={commentsData} />}
      </Paper>
    </Container>
  );
}

export default App;
