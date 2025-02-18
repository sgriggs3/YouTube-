from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import logging
import os
import json
from datetime import datetime
from uuid import uuid4
from .youtube_api import create_youtube_client
from .sentiment_analysis import perform_sentiment_analysis, generate_sentiment_trends
from .data_visualization import (
    create_wordcloud,
    create_sentiment_distribution,
    create_engagement_visualization,
)

app = Flask(__name__)
CORS(app)

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s',
        handlers=[
            logging.FileHandler('youtube_analyzer.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# Load configuration and initialize APIs
try:
    config_path = os.path.join(os.path.dirname(__file__), '../config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = json.load(f)
            api_keys = config.get('youtube_api_keys', [])
            if isinstance(config.get('youtube_api_key'), str):
                api_keys.append(config['youtube_api_key'])
    else:
        api_keys = []
        logger.warning("Config file not found")
except Exception as e:
    logger.error(f"Failed to load config: {e}")
    api_keys = []

# Initialize YouTube API client
youtube_client = create_youtube_client(api_keys)
if not youtube_client:
    logger.error("Failed to initialize YouTube API client. Please check your API keys.")

def get_video_data(video_id):
    """Get all video data including metadata, comments, and analysis."""
    if not youtube_client:
        raise RuntimeError("YouTube API client not initialized")

    metadata = youtube_client.get_video_metadata(video_id)
    if not metadata:
        raise ValueError(f"No metadata found for video ID: {video_id}")

    comments = youtube_client.get_video_comments(video_id)
    if not comments:
        logger.warning(f"No comments found for video ID: {video_id}")
        comments = []

    comment_texts = [comment['text'] for comment in comments]
    sentiment_results = perform_sentiment_analysis(comment_texts)

    timestamps = [datetime.fromisoformat(comment['timestamp'].replace('Z', '+00:00'))
                 for comment in comments]
    
    trends = generate_sentiment_trends(comment_texts, timestamps) if comments else []

    return {
        'metadata': metadata,
        'comments': comments,
        'sentiment_analysis': sentiment_results,
        'sentiment_trends': trends
    }

# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"Route not found: {request.url}")
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    logger.warning(f"Bad request: {error}")
    return jsonify({'error': str(error)}), 400

# API endpoints
@app.route('/api/analyze/<video_id>')
def analyze_video(video_id):
    """Main endpoint to analyze a video completely."""
    try:
        result = get_video_data(video_id)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        return jsonify({'error': 'Failed to analyze video'}), 500

@app.route('/api/visualizations/<video_id>')
def get_visualizations(video_id):
    """Generate and return visualization data."""
    try:
        result = get_video_data(video_id)
        
        # Generate visualization files
        viz_id = str(uuid4())
        wordcloud_path = f'temp/wordcloud_{viz_id}.html'
        sentiment_dist_path = f'temp/sentiment_dist_{viz_id}.html'
        engagement_path = f'temp/engagement_{viz_id}.html'

        create_wordcloud(result['comments'], wordcloud_path)
        create_sentiment_distribution(result['sentiment_analysis'], sentiment_dist_path)
        create_engagement_visualization(result['metadata'], engagement_path)

        return jsonify({
            'wordcloud_url': f'/static/{wordcloud_path}',
            'sentiment_distribution_url': f'/static/{sentiment_dist_path}',
            'engagement_url': f'/static/{engagement_path}'
        })
    except Exception as e:
        logger.error(f"Error generating visualizations: {e}")
        return jsonify({'error': 'Failed to generate visualizations'}), 500

if __name__ == '__main__':
    is_production = os.environ.get('FLASK_ENV') == 'production'
    port = int(os.environ.get('PORT', 5000))
    
    if not os.path.exists('temp'):
        os.makedirs('temp')
        
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not is_production
    )
