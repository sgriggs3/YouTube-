from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    """Analyzes the sentiment of a given text."""
    vs = analyzer.polarity_scores(text)
    return vs

def perform_sentiment_analysis(comments):
    """Performs sentiment analysis on a list of comments."""
    results = []
    for comment in comments:
        sentiment = analyze_sentiment(comment)
        results.append({
            'comment': comment,
            'sentiment': sentiment
        })
    return results
