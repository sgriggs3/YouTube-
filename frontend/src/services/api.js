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
  },

  async searchComments(videoId, keyword) {
    const response = await axios.get(`${BASE_URL}/search_comments`, {
      params: { video_id: videoId, keyword: keyword }
    });
    return response.data;
  },

  async getRealTimeComments(videoId) {
    const response = await axios.get(`${BASE_URL}/real_time_comments`, {
      params: { video_id: videoId }
    });
    return response.data;
  },

  async authenticateUser(username, password) {
    const response = await axios.post(`${BASE_URL}/login`, { username, password });
    return response.data;
  },

  async exportData(videoId, format) {
    const response = await axios.post(`${BASE_URL}/export_data`, { video_id: videoId, format: format });
    return response.data;
  },

  async importData(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BASE_URL}/import_data`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async shareAnalysis(videoId, platform) {
    const response = await axios.post(`${BASE_URL}/share_analysis`, { video_id: videoId, platform: platform });
    return response.data;
  },

  async createCustomDashboard(dashboardConfig) {
    const response = await axios.post(`${BASE_URL}/custom_dashboard`, { dashboard_config: dashboardConfig });
    return response.data;
  },

  async generateReport(videoId) {
    const response = await axios.get(`${BASE_URL}/reporting`, {
      params: { video_id: videoId }
    });
    return response.data;
  }
};

export default api;
