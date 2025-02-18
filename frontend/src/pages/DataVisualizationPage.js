import React from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DataVisualizationPage = ({ data }) => {
  if (!data) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          No Data Available
        </Typography>
      </Container>
    );
  }

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Data Visualizations
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">Line Chart</Typography>
            {renderLineChart()}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">Bar Chart</Typography>
            {renderBarChart()}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">Pie Chart</Typography>
            {renderPieChart()}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DataVisualizationPage;
