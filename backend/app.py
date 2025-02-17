import logging
from flask import Flask, jsonify, request, abort, Response
from flask_cors import CORS
import json
import uuid
import csv
from io import StringIO
import os  # Import the os module
from backend.utils import extract_video_id
from backend.youtube_api import get_video_details, get_comments, youtube_api_init  # Import from the new module
from backend.sentiment_analysis import analyze_sentiment  # Import the sentiment analysis function
from youtube_transcript_api import YouTubeTranscriptApi

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

app = Flask(__name__)
CORS(app)

# Global variable to store the YouTube API client
youtube = None

# Load configuration
config = {}
try:
    config = load_config()
    youtube_api_key = config.get("youtube_api_key")
    youtube = youtube_api_init(youtube_api_key)
    if youtube is None:
        logging.error("Failed to initialize YouTube API. Please check your API key.")
    else:
        logging.info("YouTube API initialized successfully.")
except Exception as e:
    logging.exception("Error loading configuration or initializing YouTube API")


@app.route("/")
def index():
    return "Backend is running!"


@app.route("/api/sentiment/trends", methods=["POST"])
def get_sentiment_trends():
    data = request.json
    filename = f"sentiment_trends_{uuid.uuid4()}.html"
    # result = visualize_sentiment_trends(data["sentiment_data"], filename) #TODO: Implement or remove before deployment
    return jsonify({"status": "success", "file": filename})


@app.route("/api/wordcloud", methods=["POST"])
def get_word_cloud():
    data = request.json
    filename = f"wordcloud_{uuid.uuid4()}.png"
    # create_word_cloud(data["text_data"], filename) #TODO: Implement or remove before deployment
    return jsonify({"status": "success", "file": filename})


@app.route("/api/sentiment/distribution", methods=["POST"])
def get_sentiment_distribution():
    data = request.json
    filename = f"distribution_{uuid.uuid4()}.html"
    # create_sentiment_distribution_chart(data["sentiment_data"], filename) #TODO: Implement or remove before deployment
    return jsonify({"status": "success", "file": filename})


@app.route("/api/engagement", methods=["POST"])
def get_user_engagement():
    data = request.json
    filename = f"engagement_{uuid.uuid4()}.html"
    # visualize_user_engagement(data["engagement_data"], "engagement.html") #TODO: Implement or remove before deployment
    return jsonify({"status": "success", "file": filename})


@app.route("/api/video-metadata/<video_id>")
def get_video_metadata_route(video_id):
    if not video_id:
        logging.error("No videoId provided")
        return jsonify({"error": "No videoId provided"}), 400
    
    # Validate video_id
    if not isinstance(video_id, str) or len(video_id) != 11:
        logging.error("Invalid videoId format: %s", video_id)
        return jsonify({"error": "Invalid videoId format. Must be an 11-character string."}), 400

    if youtube is None:
        return jsonify({'error': 'YouTube API not initialized'}), 500

    metadata = get_video_details(youtube, video_id)
    if metadata:
        if metadata and len(metadata) > 0:
            video_data = metadata['items'][0]
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



@app.route("/api/comments/csv")
def get_comments_csv_route():
    url_or_video_id = request.args.get("urlOrVideoId")
    max_results = request.args.get("maxResults", default=500, type=int)
    video_id = extract_video_id(url_or_video_id)
    if not video_id:
        video_id = url_or_video_id

    if not video_id:
        return jsonify({"error": "No videoId or valid YouTube URL provided"}), 400
        
    comments = get_comments(youtube, video_id)

    # Use StringIO to build the CSV in memory
    csv_output = StringIO()
    csv_writer = csv.writer(csv_output, quoting=csv.QUOTE_MINIMAL) # Use csv module for robust handling
    csv_writer.writerow(["Comment"])  # Header row
    for comment in comments:
        csv_writer.writerow([comment.splitlines()]) # Handle newlines in comments

    # Create a Flask response with the correct MIME type
    response = Response(csv_output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = f'attachment; filename=comments_{video_id}.csv'
    return response

@app.route("/api/sentiment-analysis")
def get_sentiment_analysis_route():
    url_or_video_id = request.args.get("urlOrVideoId")
    max_results = request.args.get("maxResults", default=500, type=int)
    video_id = extract_video_id(url_or_video_id)
    if not video_id:
        video_id = url_or_video_id

    if not video_id:
        return jsonify({"error": "No videoId or valid YouTube URL provided"}), 400

    comments_data = get_comments(youtube, video_id)
    if not comments_data or not isinstance(comments_data, list):
        return jsonify({"error": "Failed to fetch comments for sentiment analysis"}), 500

    sentiment_results = []
    for comment_text in comments_data:
        if comment_text:
            # Perform sentiment analysis using the function from sentiment_analysis.py
            analysis_result = analyze_sentiment(comment_text)
            if analysis_result:
                sentiment_label = "positive" if analysis_result['compound'] > 0 else "negative" if analysis_result['compound'] < 0 else "neutral"
                sentiment_score = analysis_result['compound']
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

@app.route('/api/video', methods=['GET'])
def api_get_video_details():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({'error': 'Missing videoId parameter'}), 400

    if youtube is None:
        return jsonify({'error': 'YouTube API not initialized'}), 500

    video_details = get_video_details(youtube, video_id)
    if video_details:
        return jsonify(video_details)
    else:
        return jsonify({'error': 'Failed to fetch video details'}), 500

@app.route('/api/comments', methods=['GET'])
def api_get_comments():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({'error': 'Missing videoId parameter'}), 400

    if youtube is None:
        return jsonify({'error': 'YouTube API not initialized'}), 500
        
    comments = get_comments(youtube, video_id)
    if comments is None:
        return jsonify({'error': 'Failed to fetch comments'}), 500

    analyzed_comments = []
    for comment in comments:
        sentiment = analyze_sentiment(comment)
        analyzed_comments.append({
            'text': comment,
            'sentiment': sentiment
        })

    return jsonify(analyzed_comments)

def load_config():
    config = {}
    config["youtube_api_key"] = os.environ.get("YOUTUBE_API_KEY")
    if not config["youtube_api_key"]:
        raise ValueError("YOUTUBE_API_KEY environment variable not set")

    # Use an absolute path for config.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, "config.json")

    with open(config_path, "r") as f:
        file_config = json.load(f)
        config.update(file_config)  # Merge file config, env vars take precedence
    return config

def authenticate_youtube_api(api_key):
    # TODO: Implement YouTube API authentication correctly
    return {"Authorization": f"Bearer {api_key}"}


# TODO: Implement or remove before deployment
def is_spam(comment):
    # Simple spam check placeholder
    return False

# TODO: Implement or remove before deployment
def save_scraping_progress(video_id, current_count, total):
    # Log progress (placeholder)
    logging.info("Progress for %s: %s/%s", video_id, current_count, total)

# TODO: Implement or remove before deployment
def get_video_metadata(youtube, video_id, max_retries=5):
    try:
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=video_id
        )
        response = request.execute()
        return response
    except HttpError as e:
        print(f"An error occurred: {e}")
        return None

# TODO: Implement or remove before deployment. Also, verify the correct import for YouTubeTranscriptApi
def get_video_transcript(video_id, max_retries=5):
    try:
        # from youtube_transcript_api import YouTubeTranscriptApi  # Placeholder
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

# TODO: Implement or remove before deployment
# def handle_user_feedback(feedback, sentiment_data):
#     # Update sentiment_data with feedback (placeholder)
#     sentiment_data.update(feedback)
#     return sentiment_data

# TODO: Implement or remove before deployment
# def get_user_input(prompt):
#     return input(prompt)

if __name__ == "__main__":
    print("Starting backend server on http://0.0.0.0:5000")
    # Use host '0.0.0.0' and disable debug mode for production deployment
    app.run(host="0.0.0.0", port=5000, debug=False)
