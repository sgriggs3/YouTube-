import logging
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import re
import json

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

from data_visualization import (
    visualize_sentiment_trends,
    create_word_cloud,
    create_sentiment_distribution_chart,
    visualize_user_engagement,
)
from youtube_api import get_video_metadata, get_video_comments
from sentiment_analysis import perform_sentiment_analysis

app = Flask(__name__)
CORS(app)


@app.route("/")
def index():
    return "Backend is running!"


@app.route("/api/sentiment/trends", methods=["POST"])
def get_sentiment_trends():
    data = request.json
    result = visualize_sentiment_trends(data["sentiment_data"], "sentiment_trends.html")
    return jsonify({"status": "success", "file": "sentiment_trends.html"})


@app.route("/api/wordcloud", methods=["POST"])
def get_word_cloud():
    data = request.json
    create_word_cloud(data["text_data"], "wordcloud.png")
    return jsonify({"status": "success", "file": "wordcloud.png"})


@app.route("/api/sentiment/distribution", methods=["POST"])
def get_sentiment_distribution():
    data = request.json
    create_sentiment_distribution_chart(data["sentiment_data"], "distribution.html")
    return jsonify({"status": "success", "file": "distribution.html"})


@app.route("/api/engagement", methods=["POST"])
def get_user_engagement():
    data = request.json
    visualize_user_engagement(data["engagement_data"], "engagement.html")
    return jsonify({"status": "success", "file": "engagement.html"})


@app.route("/api/video-metadata/<video_id>")
def get_video_metadata_route(video_id):
    metadata = get_video_metadata(video_id)
    if metadata:
        if metadata and len(metadata) > 0:
            video_data = metadata[0]
            return jsonify(
                {
                    "title": video_data["snippet"]["title"],
                    "description": video_data["snippet"]["description"],
                    "views": int(video_data["statistics"]["viewCount"]),
                    "likes": int(video_data["statistics"]["likeCount"]),
                    "publishedAt": video_data["snippet"]["publishedAt"],
                }
            )
        else:
            logging.error("Video metadata not found for video_id: %s", video_id)
            return jsonify({"error": "Video metadata not found"}), 404
    else:
        logging.error("Failed to fetch video metadata for video_id: %s", video_id)
        return jsonify({"error": "Failed to fetch video metadata"}), 500


@app.route("/api/comments")
def get_comments_route():
    try:
        url_or_video_id = request.args.get("urlOrVideoId")
        max_results = request.args.get("maxResults", default=500, type=int)
        video_id = None
        if url_or_video_id:
            # Regex to extract videoId from YouTube URL
            match = re.search(r"(?:v=|\/embed\/|\/watch\?v=|\/shorts\/|youtu\.be\/)([\w-]{11})", url_or_video_id)
            if match:
                video_id = match.group(1)
            else:
                video_id = url_or_video_id  # Assume it's already a videoId

        if not video_id:
            logging.error("No valid videoId or URL provided")
            return jsonify({"error": "No videoId or valid YouTube URL provided"}), 400

        comments = get_video_comments(video_id, comment_limit=max_results)
        return jsonify(comments)
    except Exception as e:
        logging.exception("Error fetching comments")
        return jsonify({"error": str(e)}), 500

@app.route("/api/comments/csv")
def get_comments_csv_route():
    video_id = request.args.get("urlOrVideoId")
    max_results = request.args.get("maxResults", default=500, type=int)
    video_id_extracted = None
    if video_id:
        match = re.search(r"(?:v=|\/embed\/|\/watch\?v=|\/shorts\/|youtu\.be\/)([\w-]{11})", video_id)
        if match:
            video_id_extracted = match.group(1)
        else:
            video_id_extracted = video_id

    if not video_id_extracted:
        return jsonify({"error": "No videoId or valid YouTube URL provided"}), 400

    comments = get_video_comments(video_id_extracted, comment_limit=max_results)
    
    csv_filename = f"comments_{video_id_extracted}.csv"
    csv_content = "Comment\n"  # Header
    for comment in comments:
        csv_content += f"{comment['comment'].replace('\"', '').replace(',', ';')}\n" # Basic CSV formatting, replace quotes and commas

    return jsonify({"status": "success", "file": csv_filename, "csv_content": csv_content})


@app.route("/api/sentiment-analysis")
def get_sentiment_analysis_route():
    video_id = request.args.get("urlOrVideoId")
    max_results = request.args.get("maxResults", default=500, type=int)
    video_id_extracted = None
    if video_id:
        match = re.search(r"(?:v=|\/embed\/|\/watch\?v=|\/shorts\/|youtu\.be\/)([\w-]{11})", video_id)
        if match:
            video_id_extracted = match.group(1)
        else:
            video_id_extracted = video_id

    if not video_id_extracted:
        return jsonify({"error": "No videoId or valid YouTube URL provided"}), 400

    comments_data = get_video_comments(video_id_extracted, comment_limit=max_results)
    if not comments_data or not isinstance(comments_data, list):
        return jsonify({"error": "Failed to fetch comments for sentiment analysis"}), 500

    sentiment_results = []
    for comment_item in comments_data:
        comment_text = comment_item.get('comment', '')
        if comment_text:
            # Perform sentiment analysis using the function from sentiment_analysis.py
            analysis_result = perform_sentiment_analysis([comment_text])
            if analysis_result and not analysis_result.empty:
                sentiment_label = analysis_result['vader_sentiment'][0]['label'] if 'vader_sentiment' in analysis_result.columns else 'neutral' # Default to neutral if vader_sentiment is not available
                sentiment_score = analysis_result['vader_sentiment'][0]['compound'] if 'vader_sentiment' in analysis_result.columns else 0.0
                sentiment_results.append({
                    "comment": comment_text,
                    "sentiment_label": sentiment_label,
                    "sentiment_score": sentiment_score
                })

    return jsonify({"status": "success", "sentiment_results": sentiment_results})


@app.errorhandler(404)
def not_found_error(error):
    logging.error("404 error: %s", error)
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logging.error("500 error: %s", error)
    return jsonify({"error": "Internal server error"}), 500

def load_config():
    with open("config.json", "r") as f:
        return json.load(f)
        
def authenticate_youtube_api(api_key):
    return {"Authorization": f"Bearer {api_key}"}

def get_video_comments(video_id, scrape_type="latest", comment_limit=500):
    # Placeholder: return an empty list of comments
    return []

def is_spam(comment):
    # Simple spam check placeholder
    return False

def save_scraping_progress(video_id, current_count, total):
    # Log progress (placeholder)
    logging.info("Progress for %s: %s/%s", video_id, current_count, total)

def get_video_metadata(video_id, max_retries=5):
    # Return dummy metadata data
    return [{"snippet": {"title": "Sample Video", "description": "Description", "publishedAt": "2020-01-01T00:00:00Z"},
             "statistics": {"viewCount": "12345", "likeCount": "678"}}]

def get_video_transcript(video_id, max_retries=5):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return transcript
    except Exception as e:
        print(e)
        return []

def save_data_to_csv(data, filename):
    import pandas as pd
    pd.DataFrame(data).to_csv(filename, index=False)

def save_data_to_json(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f)

def load_data_from_json(filename):
    with open(filename, "r") as f:
        return json.load(f)

def extract_video_id(url):
    import re
    match = re.search(r"v=([^&]+)", url)
    return match.group(1) if match else None

def handle_user_feedback(feedback, sentiment_data):
    # Update sentiment_data with feedback (placeholder)
    sentiment_data.update(feedback)
    return sentiment_data

def get_user_input(prompt):
    return input(prompt)

if __name__ == "__main__":
    # Use host '0.0.0.0' and disable debug mode for production deployment
    app.run(host="0.0.0.0", port=5000, debug=False)
