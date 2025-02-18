from transformers import pipeline
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import numpy as np
from collections import defaultdict
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
import torch

logger = logging.getLogger(__name__)

# Thread-local storage for sentiment analyzers
thread_local = threading.local()

def get_analyzers():
    """Get or initialize thread-local sentiment analyzers."""
    if not hasattr(thread_local, "analyzers"):
        try:
            thread_local.analyzers = {
                "vader": SentimentIntensityAnalyzer(),
                "bert": pipeline("sentiment-analysis", model="bert-base-uncased", device=0 if torch.cuda.is_available() else -1),
                "roberta": pipeline("sentiment-analysis", model="roberta-base", device=0 if torch.cuda.is_available() else -1),
                "aspect_based": pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment", device=0 if torch.cuda.is_available() else -1),
                "emotion": pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", device=0 if torch.cuda.is_available() else -1)
            }
        except Exception as e:
            logger.error(f"Failed to initialize analyzers: {e}")
            raise
    return thread_local.analyzers

def analyze_sentiment(text):
    """
    Analyzes the sentiment of a given text using multiple models.
    Returns combined sentiment analysis results including aspect-based sentiment and emotion detection.
    """
    if not text or not isinstance(text, str):
        return {
            "vader": {"compound": 0, "pos": 0, "neu": 0, "neg": 0},
            "bert": {"label": "NEUTRAL", "score": 0.5},
            "roberta": {"label": "NEUTRAL", "score": 0.5},
            "combined_score": 0,
            "aspect_based": {},
            "emotion_detection": {}
        }

    analyzers = get_analyzers()
    
    # VADER analysis
    vader_scores = analyzers["vader"].polarity_scores(text)
    
    # Transformer analysis
    try:
        bert_result = analyzers["bert"](text, batch_size=8)[0]
        roberta_result = analyzers["roberta"](text, batch_size=8)[0]
        aspect_based_result = analyzers["aspect_based"](text, batch_size=8)[0]
        emotion_result = analyzers["emotion"](text, batch_size=8)[0]
    except Exception as e:
        logger.error(f"Transformer analysis failed: {e}")
        bert_result = {"label": "NEUTRAL", "score": 0.5}
        roberta_result = {"label": "NEUTRAL", "score": 0.5}
        aspect_based_result = {"label": "NEUTRAL", "score": 0.5}
        emotion_result = {"label": "NEUTRAL", "score": 0.5}
    
    # Combine scores using ensemble method
    combined_score = np.mean([
        vader_scores["compound"],
        (1 if bert_result["label"] == "POSITIVE" else -1) * bert_result["score"],
        (1 if roberta_result["label"] == "POSITIVE" else -1) * roberta_result["score"],
        (1 if aspect_based_result["label"] == "POSITIVE" else -1) * aspect_based_result["score"],
        (1 if emotion_result["label"] == "POSITIVE" else -1) * emotion_result["score"]
    ])

    return {
        "vader": vader_scores,
        "bert": bert_result,
        "roberta": roberta_result,
        "combined_score": combined_score,
        "aspect_based": aspect_based_result,
        "emotion_detection": emotion_result
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