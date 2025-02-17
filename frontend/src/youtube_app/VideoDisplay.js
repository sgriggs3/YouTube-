import React from 'react';

function VideoDisplay({ videoData }) {
  if (!videoData) {
    return <div>No video data to display.</div>;
  }

  return (
    <div>
      <h2>{videoData.snippet.title}</h2>
      <p>{videoData.snippet.description}</p>
      <p>Views: {videoData.statistics.viewCount}</p>
      {/* Add more video details as needed */}
    </div>
  );
}

export default VideoDisplay;