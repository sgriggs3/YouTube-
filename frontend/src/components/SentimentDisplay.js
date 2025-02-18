import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const SentimentDisplay = ({ sentiment }) => {
  if (!sentiment) {
    return <Typography variant="h6">No sentiment analysis available</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Sentiment Analysis Results</Typography>
        {sentiment.map((result, index) => (
          <div key={index}>
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SentimentDisplay;
