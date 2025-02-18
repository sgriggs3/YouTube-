import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analysis from './pages/Analysis';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import './App.css';
import CustomThemeProvider from './ThemeContext';
import AdvancedSearch from './pages/AdvancedSearch';
import RealTimeUpdates from './pages/RealTimeUpdates';
import UserAuthentication from './pages/UserAuthentication';
import DataExportImport from './pages/DataExportImport';
import SocialMediaIntegration from './pages/SocialMediaIntegration';
import CustomDashboards from './pages/CustomDashboards';
import ReportingAnalytics from './pages/ReportingAnalytics';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis/:videoId?" element={<Analysis />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              <Route path="/real-time-updates" element={<RealTimeUpdates />} />
              <Route path="/user-authentication" element={<UserAuthentication />} />
              <Route path="/data-export-import" element={<DataExportImport />} />
              <Route path="/social-media-integration" element={<SocialMediaIntegration />} />
              <Route path="/custom-dashboards" element={<CustomDashboards />} />
              <Route path="/reporting-analytics" element={<ReportingAnalytics />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;
