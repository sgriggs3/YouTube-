import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const SentimentChart = () => {
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sentiment Score',
        data: [],
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    socket.on('newData', (data) => {
      setChartData((prevData) => ({
        ...prevData,
        labels: [...prevData.labels, data.time],
        datasets: [
          {
            ...prevData.datasets[0],
            data: [...prevData.datasets[0].data, data.sentiment],
          },
        ],
      }));
    });

    return () => {
      socket.off('newData');
    };
  }, []);

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      default:
        return <Line data={chartData} />;
    }
  };

  return (
    <div>
      <h2>Sentiment Analysis Chart</h2>
      <select value={chartType} onChange={handleChartTypeChange}>
        <option value="line">Line</option>
        <option value="bar">Bar</option>
        <option value="pie">Pie</option>
      </select>
      {renderChart()}
    </div>
  );
};

export default SentimentChart;