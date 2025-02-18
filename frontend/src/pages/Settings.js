import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box
} from '@mui/material';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    youtubeApiKey: '',
    enableRealTimeAnalysis: false,
    enableNotifications: false,
    customBaseUrl: '',
    apiProvider: '',
    modelSelection: '',
    additionalSettings: '',
    theme: 'light',
    enableAuthentication: false,
    enableRoleBasedAccess: false,
    exportFormat: 'json',
    socialMediaPlatform: '',
    customDashboardConfig: '',
    reportingFrequency: 'daily',
  });

  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.getProviders();
        setProviders(response);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      await api.saveSettings(settings);
      localStorage.setItem('settings', JSON.stringify(settings));
      setTheme(settings.theme);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Paper sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="YouTube API Key"
            name="youtubeApiKey"
            value={settings.youtubeApiKey}
            onChange={handleChange}
            margin="normal"
            type="password"
          />

          <Select
            fullWidth
            name="apiProvider"
            label="API Provider"
            value={settings.apiProvider}
            onChange={handleChange}
            margin="normal"
          >
            {providers.map(provider => (
              <MenuItem key={provider} value={provider}>{provider}</MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Model Selection"
            name="modelSelection"
            value={settings.modelSelection}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Additional Settings"
            name="additionalSettings"
            value={settings.additionalSettings}
            onChange={handleChange}
            margin="normal"
          />

          <Select
            fullWidth
            name="theme"
            label="Theme"
            value={settings.theme}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>

          <TextField
            fullWidth
            label="Custom Base URL"
            name="customBaseUrl"
            value={settings.customBaseUrl}
            onChange={handleChange}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableRealTimeAnalysis}
                onChange={handleChange}
                name="enableRealTimeAnalysis"
              />
            }
            label="Enable Real-time Analysis"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableNotifications}
                onChange={handleChange}
                name="enableNotifications"
              />
            }
            label="Enable Notifications"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableAuthentication}
                onChange={handleChange}
                name="enableAuthentication"
              />
            }
            label="Enable User Authentication"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableRoleBasedAccess}
                onChange={handleChange}
                name="enableRoleBasedAccess"
              />
            }
            label="Enable Role-Based Access Control"
          />

          <TextField
            fullWidth
            label="Export Format"
            name="exportFormat"
            value={settings.exportFormat}
            onChange={handleChange}
            margin="normal"
            select
          >
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="excel">Excel</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Social Media Platform"
            name="socialMediaPlatform"
            value={settings.socialMediaPlatform}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Custom Dashboard Configuration"
            name="customDashboardConfig"
            value={settings.customDashboardConfig}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Reporting Frequency"
            name="reportingFrequency"
            value={settings.reportingFrequency}
            onChange={handleChange}
            margin="normal"
            select
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            For more information about API keys and settings, please visit the{' '}
            <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
              API Provider Documentation
            </a>.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
