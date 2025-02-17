from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import logging
import os
import re
import json
from uuid import uuid4
from youtube_api import authenticate_youtube_api, get_video_metadata, get_video_comments, youtube_api_init
from sentiment_analysis import analyze_sentiment, generate_sentiment_trends
from data_visualization import (
    create_wordcloud,
    create_sentiment_distribution,
    create_engagement_visualization,
    create_basic_charts
)
from utils import extract_video_id, setup_logging

app = Flask(__name__)
CORS(app)

# Configure logging
setup_logging()
logger = logging.getLogger(__name__)

# Load configuration
try:
    with open(os.path.join(os.path.dirname(__file__), '../config.json'), 'r') as f:
        config = json.load(f)
except Exception as e:
    logger.error(f"Failed to load config: {e}")
    config = {}

# Initialize YouTube API
youtube = youtube_api_init(config.get("youtube_api_key"))
if youtube is None:
    logger.error("Failed to initialize YouTube API. Please check your API key.")

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/video-metadata/<video_id>')
def get_video_metadata_route(video_id):
    try:
        video_id = extract_video_id(video_id)
        metadata = get_video_metadata(youtube, video_id)
        return jsonify(metadata)
    except Exception as e:
        logger.error(f"Error fetching video metadata: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments')
def get_comments_route():
    try:
        video_id = extract_video_id(request.args.get('urlOrVideoId', ''))
        comments = get_video_comments(youtube, video_id)
        return jsonify(comments)
    except Exception as e:
        logger.error(f"Error fetching comments: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment-analysis')
def analyze_sentiment_route():
    try:
        video_id = extract_video_id(request.args.get('urlOrVideoId', ''))
        comments = get_video_comments(youtube, video_id)
        results = analyze_sentiment(comments)
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment/trends', methods=['POST'])
def sentiment_trends_route():
    try:
        data = request.get_json()
        filename = f'sentiment_trends_{uuid4()}.html'
        generate_sentiment_trends(data['comments'], filename)
        return send_file(filename)
    except Exception as e:
        logger.error(f"Error generating sentiment trends: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/wordcloud', methods=['POST'])
def wordcloud_route():
    try:
        data = request.get_json()
        filename = f'wordcloud_{uuid4()}.png'
        create_wordcloud(data['comments'], filename)
        return send_file(filename)
    except Exception as e:
        logger.error(f"Error generating wordcloud: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment/distribution', methods=['POST'])
def sentiment_distribution_route():
    try:
        data = request.get_json()
        filename = f'distribution_{uuid4()}.html'
        create_sentiment_distribution(data['comments'], filename)
        return send_file(filename)
    except Exception as e:
        logger.error(f"Error generating sentiment distribution: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/engagement', methods=['POST'])
def engagement_route():
    try:
        data = request.get_json()
        filename = f'engagement_{uuid4()}.html'
        create_engagement_visualization(data['comments'], filename)
        return send_file(filename)
    except Exception as e:
        logger.error(f"Error generating engagement visualization: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualizations/<video_id>/<chart_type>')
def visualizations_route(video_id, chart_type):
    try:
        video_id = extract_video_id(video_id)
        comments = get_video_comments(youtube, video_id)
        output_dir = 'visualizations'
        charts = create_basic_charts(comments, output_dir)
        chart_file = charts.get(chart_type)
        if chart_file:
            return send_file(chart_file)
        else:
            return jsonify({'error': 'Invalid chart type'}), 400
    except Exception as e:
        logger.error(f"Error generating visualization: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def update_settings():
    try:
        new_settings = request.get_json()
        with open(os.path.join(os.path.dirname(__file__), '../config.json'), 'w') as f:
            json.dump(new_settings, f, indent=4)
        return jsonify({'message': 'Settings updated successfully'})
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    is_production = os.environ.get('FLASK_ENV') == 'production'
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=not is_production
    )
