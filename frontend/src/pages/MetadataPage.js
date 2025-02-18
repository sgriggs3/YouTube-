import React from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';

const MetadataPage = ({ metadata }) => {
  if (!metadata) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          No Metadata Available
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Video Metadata
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">{metadata.title}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">{metadata.description}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Published At:</strong> {new Date(metadata.publishedAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Views:</strong> {metadata.viewCount}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Likes:</strong> {metadata.likeCount}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Comments:</strong> {metadata.commentCount}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MetadataPage;
