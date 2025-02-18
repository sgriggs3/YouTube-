import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MetadataDisplay = ({ metadata }) => {
  if (!metadata) {
    return <Typography variant="h6">No metadata available</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{metadata.title}</Typography>
        <Typography variant="body2" color="textSecondary">
          {metadata.description}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Published at: {new Date(metadata.publishedAt).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Views: {metadata.viewCount}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Likes: {metadata.likeCount}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Comments: {metadata.commentCount}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetadataDisplay;
