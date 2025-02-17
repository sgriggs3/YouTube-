import unittest
from backend.sentiment_analysis import analyze_sentiment, perform_sentiment_analysis

class TestSentimentAnalysis(unittest.TestCase):

    def test_analyze_sentiment_positive(self):
        text = "I love this video!"
        result = analyze_sentiment(text)
        self.assertGreater(result['compound'], 0)

    def test_analyze_sentiment_negative(self):
        text = "I hate this video!"
        result = analyze_sentiment(text)
        self.assertLess(result['compound'], 0)

    def test_analyze_sentiment_neutral(self):
        text = "This video is okay."
        result = analyze_sentiment(text)
        self.assertEqual(result['compound'], 0)

    def test_perform_sentiment_analysis(self):
        comments = ["I love this video!", "I hate this video!", "This video is okay."]
        results = perform_sentiment_analysis(comments)
        self.assertEqual(len(results), 3)
        self.assertGreater(results[0]['sentiment']['compound'], 0)
        self.assertLess(results[1]['sentiment']['compound'], 0)
        self.assertEqual(results[2]['sentiment']['compound'], 0)

if __name__ == '__main__':
    unittest.main()
