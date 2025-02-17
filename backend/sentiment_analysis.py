from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    """Analyzes the sentiment of a given text."""
    vs = analyzer.polarity_scores(text)
    return vs