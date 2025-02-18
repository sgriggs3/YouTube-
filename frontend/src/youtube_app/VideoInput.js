import React, { useState } from 'react';

function VideoInput({ onVideoSubmit }) {
  const [videoId, setVideoId] = useState('');
  const [chartType, setChartType] = useState('line');

  const handleChange = (event) => {
    setVideoId(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onVideoSubmit(videoId, chartType);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="video-id">YouTube Video URL or ID:</label>
        <input
          type="text"
          id="video-id"
          value={videoId}
          onChange={handleChange}
          placeholder="Enter YouTube video URL or ID"
        />
        <label htmlFor="chart-type">Select Chart Type:</label>
        <select id="chart-type" value={chartType} onChange={handleChartTypeChange}>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
        <button type="submit">Analyze</button>
      </form>
    </div>
  );
}

export default VideoInput;
