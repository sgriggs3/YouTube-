// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// Define the SentimentChart component
const SentimentChart = ({ data, initialType }) => {
  const [chartData, setChartData] = useState(data);
  const [chartType, setChartType] = useState(initialType);

  // Function to update chart data in real-time
  const updateChartData = () => {
    // Fetch new data from an API or other source
    // For demonstration, we'll simulate data update
    const newData = data.map(item => ({
      ...item,
      value: item.value + Math.floor(Math.random() * 10 - 5)
    }));
    setChartData(newData);
  };

  useEffect(() => {
    // Set an interval to update chart data every 5 seconds
    const interval = setInterval(updateChartData, 5000);
    return () => clearInterval(interval);
  }, [data]);

  // Prepare data for the chart
  const chartConfig = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        label: 'Sentiment Analysis',
        data: chartData.map(item => item.value),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  // Render the appropriate chart type based on the 'chartType' state
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartConfig} />;
      case 'bar':
        return <Bar data={chartConfig} />;
      case 'pie':
        return <Pie data={chartConfig} />;
      case 'doughnut':
        return <Doughnut data={chartConfig} />;
      case 'radar':
        return <Radar data={chartConfig} />;
      default:
        return <Line data={chartConfig} />;
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  return (
    <div>
      <h2>Sentiment Chart</h2>
      <select onChange={handleChartTypeChange} value={chartType}>
        <option value="line">Line</option>
        <option value="bar">Bar</option>
        <option value="pie">Pie</option>
        <option value="doughnut">Doughnut</option>
        <option value="radar">Radar</option>
      </select>
      {renderChart()}
    </div>
  );
};

export default SentimentChart;