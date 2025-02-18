import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  async getVideoMetadata(videoId) {
    const response = await axios.get(`${BASE_URL}/video-metadata/${videoId}`);
    return response.data;
  },

  async analyzeSentiment(videoId) {
    const response = await axios.get(`${BASE_URL}/sentiment-analysis?urlOrVideoId=${videoId}`);
    const data = response.data;
    // Transform the data into the format expected by the SentimentChart component
    const transformedData = Object.entries(data).map(([comment, analysis]) => ({
      comment: comment,
      sentiment: analysis.combined_score,
    }));
    return transformedData;
  },

  async getSentimentTrends(comments) {
    const response = await axios.post(`${BASE_URL}/sentiment/trends`, { comments });
    return response.data;
  },

  async getWordcloud(comments) {
    const response = await axios.post(`${BASE_URL}/wordcloud`, { comments });
    return response.data;
  },

  async getEngagementMetrics(videoId) {
    const response = await axios.get(`${BASE_URL}/engagement?urlOrVideoId=${videoId}`);
    return response.data;
  },

  async getProviders() {
    const response = await axios.get(`${BASE_URL}/providers`);
    return response.data;
  },

  async saveSettings(settings) {
    const response = await axios.post(`${BASE_URL}/settings`, settings);
    return response.data;
  }
};

export default api;
