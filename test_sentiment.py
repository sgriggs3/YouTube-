import sentiment_analysis
import pandas as pd

def test_sentiment():
    test_comments = [
        "This video is great!",
        "I hate this video.",
        "This video is okay.",
        "This is the worst video ever!",
        "I love the insights in this video."
    ]
    results = sentiment_analysis.perform_sentiment_analysis(test_comments)
    print(results)

if __name__ == "__main__":
    test_sentiment()