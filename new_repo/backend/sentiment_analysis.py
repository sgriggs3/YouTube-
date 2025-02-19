from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import numpy as np
from collections import defaultdict
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
import time

logger = logging.getLogger(__name__)

# Thread-local storage for sentiment analyzers
thread_local = threading.local()

def get_analyzers():
    """Get or initialize thread-local sentiment analyzers."""
    if not hasattr(thread_local, "analyzers"):
        thread_local.analyzers = {
            "vader": SentimentIntensityAnalyzer(),
            "transformer": pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        }
    return thread_local.analyzers

def analyze_sentiment(text):
    """
    Analyzes the sentiment of a given text using multiple models.
    Returns combined sentiment analysis results.
    """
    if not text or not isinstance(text, str):
        return {
            "vader": {"compound": 0, "pos": 0, "neu": 0, "neg": 0},
            "transformer": {"label": "NEUTRAL", "score": 0.5},
            "combined_score": 0
        }

    analyzers = get_analyzers()
    
    # VADER analysis
    vader_scores = analyzers["vader"].polarity_scores(text)
    
    # Transformer analysis
    try:
        transformer_result = analyzers["transformer"](text)[0]
    except Exception as e:
        logger.error(f"Transformer analysis failed: {e}")
        transformer_result = {"label": "NEUTRAL", "score": 0.5}
    
    # Combine scores
    combined_score = (vader_scores["compound"] + (
        1 if transformer_result["label"] == "POSITIVE" else -1
    ) * transformer_result["score"]) / 2

    return {
        "vader": vader_scores,
        "transformer": transformer_result,
        "combined_score": combined_score
    }

def analyze_comments_batch(comments, batch_size=32):
    """Analyze a batch of comments in parallel."""
    with ThreadPoolExecutor(max_workers=min(len(comments), 4)) as executor:
        results = list(executor.map(
            lambda comment: (comment, analyze_sentiment(comment)),
            comments
        ))
    return results

def perform_sentiment_analysis(comments):
    """
    Performs comprehensive sentiment analysis on a list of comments.
    Includes overall statistics and temporal analysis.
    """
    if not comments:
        return {
            "individual_results": [],
            "overall_stats": {},
            "temporal_analysis": {}
        }

    # Analyze comments in batches
    analyzed_comments = analyze_comments_batch(comments)
    
    # Calculate overall statistics
    sentiment_stats = defaultdict(int)
    scores = []
    
    for comment, analysis in analyzed_comments:
        combined_score = analysis["combined_score"]
        scores.append(combined_score)
        
        if combined_score >= 0.05:
            sentiment_stats["positive"] += 1
        elif combined_score <= -0.05:
            sentiment_stats["negative"] += 1
        else:
            sentiment_stats["neutral"] += 1
    
    total_comments = len(comments)
    overall_stats = {
        "total_comments": total_comments,
        "sentiment_distribution": {
            k: (v / total_comments) * 100 for k, v in sentiment_stats.items()
        },
        "average_sentiment": np.mean(scores) if scores else 0,
        "sentiment_variance": np.var(scores) if scores else 0
    }

    # Structure the results
    results = {
        "individual_results": [
            {
                "comment": comment,
                "analysis": analysis,
            } for comment, analysis in analyzed_comments
        ],
        "overall_stats": overall_stats,
    }

    return results

def generate_sentiment_trends(comments, timestamps):
    """
    Generate sentiment trends over time.
    Expects comments and their corresponding timestamps.
    """
    if not comments or not timestamps:
        return []
        
    # Sort comments by timestamp
    comment_times = sorted(zip(comments, timestamps))
    
    # Analyze sentiments with timestamps
    trends = []
    window_size = max(1, len(comments) // 10)  # Dynamic window size
    
    for i in range(0, len(comment_times), window_size):
        window = comment_times[i:i+window_size]
        window_comments = [w[0] for w in window]
        avg_timestamp = sum(w[1] for w in window) / len(window)
        
        # Analyze sentiment for the window
        sentiment_results = perform_sentiment_analysis(window_comments)
        
        trends.append({
            "timestamp": avg_timestamp,
            "average_sentiment": sentiment_results["overall_stats"]["average_sentiment"],
            "num_comments": len(window_comments)
        })
    
    return trends
