# In app.py
config = {}
try:
    config = load_config()
    youtube_api_key = config.get("youtube_api_key")
    youtube = youtube_api_init(youtube_api_key)
    if youtube is None:
        logging.error("Failed to initialize YouTube API. Please check your API key.")from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    """Analyzes the sentiment of a given text."""
    vs = analyzer.polarity_scores(text)
    return vs