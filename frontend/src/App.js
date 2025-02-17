import React from 'react';

// Configure the backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  );
}

// Example API usage:
function fetchVideoDetails(videoId) {
  fetch(`${BACKEND_URL}/api/video-metadata/${videoId}`)
    .then((res) => res.json())
    .then((data) => {
      // ...existing code...
    })
    .catch((err) => console.error(err));
}

export default App;
