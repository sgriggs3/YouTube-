import React, { useState } from 'react';
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

const Dashboard = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (videoUrl) {
      navigate(`/analysis/${encodeURIComponent(videoUrl)}`);
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
                  disabled={!videoUrl}
                >
                  Analyze Video
                </Button>
              </Grid>
            </Grid>
          </form>
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
