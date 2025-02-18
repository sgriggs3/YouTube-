import React from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';

const SentimentAnalysisPage = ({ sentiment }) => {
  if (!sentiment) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          No Sentiment Analysis Available
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Sentiment Analysis Results
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Grid container spacing={2}>
          {sentiment.map((result, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="body1">
                <strong>Comment:</strong> {result.comment}
              </Typography>
              <Typography variant="body2">
                <strong>Sentiment Score:</strong> {result.sentiment.compound}
              </Typography>
              <Typography variant="body2">
                <strong>Positive:</strong> {result.sentiment.pos}
              </Typography>
              <Typography variant="body2">
                <strong>Negative:</strong> {result.sentiment.neg}
              </Typography>
              <Typography variant="body2">
                <strong>Neutral:</strong> {result.sentiment.neu}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default SentimentAnalysisPage;
