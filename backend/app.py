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
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)

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

@app.route('/api/providers', methods=['GET'])
def get_providers():
    """Endpoint to fetch available API providers and models."""
    try:
        providers = {
            "OpenRouter": ["Model1", "Model2"],
            "Anthropic": ["ModelA", "ModelB"],
            "Google Gemini": ["ModelX", "ModelY"]
        }
        return jsonify(providers)
    except Exception as e:
        logger.error(f"Error fetching providers: {e}")
        return jsonify({'error': 'Failed to fetch providers'}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    """Endpoint to save user settings."""
    try:
        settings = request.json
        with open('user_settings.json', 'w') as f:
            json.dump(settings, f, indent=4)
        return jsonify({'message': 'Settings saved successfully'})
    except Exception as e:
        logger.error(f"Error saving settings: {e}")
        return jsonify({'error': 'Failed to save settings'}), 500

@app.route('/api/search_comments', methods=['GET'])
def search_comments():
    """Endpoint to search within comments."""
    try:
        video_id = request.args.get('video_id')
        keyword = request.args.get('keyword')
        if not video_id or not keyword:
            return jsonify({'error': 'Missing video_id or keyword'}), 400

        comments = youtube_client.get_video_comments(video_id)
        filtered_comments = [comment for comment in comments if keyword.lower() in comment['text'].lower()]

        return jsonify(filtered_comments)
    except Exception as e:
        logger.error(f"Error searching comments: {e}")
        return jsonify({'error': 'Failed to search comments'}), 500

@app.route('/api/export_data', methods=['POST'])
def export_data():
    """Endpoint to export data in various formats."""
    try:
        data = request.json
        export_format = data.get('format', 'json')
        video_id = data.get('video_id')
        if not video_id:
            return jsonify({'error': 'Missing video_id'}), 400

        result = get_video_data(video_id)

        if export_format == 'csv':
            df = pd.DataFrame(result['comments'])
            csv_path = f'temp/comments_{video_id}.csv'
            df.to_csv(csv_path, index=False)
            return send_file(csv_path, as_attachment=True)
        elif export_format == 'json':
            json_path = f'temp/comments_{video_id}.json'
            with open(json_path, 'w') as f:
                json.dump(result, f, indent=4)
            return send_file(json_path, as_attachment=True)
        elif export_format == 'excel':
            df = pd.DataFrame(result['comments'])
            excel_path = f'temp/comments_{video_id}.xlsx'
            df.to_excel(excel_path, index=False)
            return send_file(excel_path, as_attachment=True)
        else:
            return jsonify({'error': 'Unsupported export format'}), 400
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        return jsonify({'error': 'Failed to export data'}), 500

@app.route('/api/import_data', methods=['POST'])
def import_data():
    """Endpoint to import data from external sources."""
    try:
        file = request.files['file']
        if not file:
            return jsonify({'error': 'No file provided'}), 400

        df = pd.read_csv(file)
        comments = df.to_dict(orient='records')
        return jsonify({'message': 'Data imported successfully', 'comments': comments})
    except Exception as e:
        logger.error(f"Error importing data: {e}")
        return jsonify({'error': 'Failed to import data'}), 500

@app.route('/api/share_analysis', methods=['POST'])
def share_analysis():
    """Endpoint to share analysis results on social media."""
    try:
        data = request.json
        platform = data.get('platform')
        analysis_url = data.get('analysis_url')
        if not platform or not analysis_url:
            return jsonify({'error': 'Missing platform or analysis_url'}), 400

        # Placeholder for actual sharing logic
        return jsonify({'message': f'Analysis shared on {platform}'})
    except Exception as e:
        logger.error(f"Error sharing analysis: {e}")
        return jsonify({'error': 'Failed to share analysis'}), 500

@app.route('/api/custom_dashboard', methods=['POST'])
def custom_dashboard():
    """Endpoint to create custom dashboards."""
    try:
        data = request.json
        dashboard_config = data.get('dashboard_config')
        if not dashboard_config:
            return jsonify({'error': 'Missing dashboard_config'}), 400

        # Placeholder for actual dashboard creation logic
        return jsonify({'message': 'Custom dashboard created successfully'})
    except Exception as e:
        logger.error(f"Error creating custom dashboard: {e}")
        return jsonify({'error': 'Failed to create custom dashboard'}), 500

@app.route('/api/reporting', methods=['GET'])
def reporting():
    """Endpoint to generate automated reports on video performance."""
    try:
        video_id = request.args.get('video_id')
        if not video_id:
            return jsonify({'error': 'Missing video_id'}), 400

        result = get_video_data(video_id)
        report = {
            'total_comments': len(result['comments']),
            'average_sentiment': result['sentiment_analysis']['overall_stats']['average_sentiment'],
            'engagement_metrics': result['metadata']['statistics']
        }
        return jsonify(report)
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({'error': 'Failed to generate report'}), 500

@app.route('/api/mcp_integration', methods=['POST'])
def mcp_integration():
    """Endpoint to integrate with MCP server for additional tools and resources."""
    try:
        data = request.json
        mcp_server_url = data.get('mcp_server_url')
        if not mcp_server_url:
            return jsonify({'error': 'Missing mcp_server_url'}), 400

        # Placeholder for actual MCP integration logic
        return jsonify({'message': 'Integrated with MCP server successfully'})
    except Exception as e:
        logger.error(f"Error integrating with MCP server: {e}")
        return jsonify({'error': 'Failed to integrate with MCP server'}), 500

@app.route('/api/register', methods=['POST'])
def register():
    """Endpoint to register a new user."""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        hashed_password = generate_password_hash(password)
        # Placeholder for actual user registration logic
        return jsonify({'message': 'User registered successfully'})
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify({'error': 'Failed to register user'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint to login a user."""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        # Placeholder for actual user authentication logic
        if username == 'test' and check_password_hash(generate_password_hash('test'), password):
            access_token = create_access_token(identity=username)
            return jsonify({'access_token': access_token})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return jsonify({'error': 'Failed to login user'}), 500

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    """Protected endpoint accessible only to authenticated users."""
    current_user = get_jwt_identity()
    return jsonify({'message': f'Hello, {current_user}!'})

@socketio.on('connect')
def handle_connect():
    emit('message', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('new_comment')
def handle_new_comment(data):
    emit('new_comment', data, broadcast=True)

if __name__ == '__main__':
    is_production = os.environ.get('FLASK_ENV') == 'production'
    port = int(os.environ.get('PORT', 5000))
    
    if not os.path.exists('temp'):
        os.makedirs('temp')
        
    socketio.run(app, host='0.0.0.0', port=port, debug=not is_production)
