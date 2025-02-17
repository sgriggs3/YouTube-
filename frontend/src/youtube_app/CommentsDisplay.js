import React from 'react';

function CommentsDisplay({ comments }) {
  if (!comments || comments.length === 0) {
    return <div>No comments to display.</div>;
  }

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comment, index) => (
          <li key={index}>
            <p>Comment: {comment.text}</p>
            <p>Sentiment: {JSON.stringify(comment.sentiment)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentsDisplay;