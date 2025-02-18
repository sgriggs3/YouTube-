from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
import logging
import time
import os
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class YouTubeAPI:
    def __init__(self, api_keys: List[str]):
        self.api_keys = api_keys
        self.current_key_index = 0
        self.quota_usage = {key: 0 for key in api_keys}
        self.last_request_time = datetime.now()
        self.youtube = None
        self.initialize_client()

    def initialize_client(self) -> None:
        """Initialize the YouTube API client with the current API key."""
        try:
            self.youtube = build("youtube", "v3", 
                               developerKey=self.api_keys[self.current_key_index])
            logger.info("YouTube API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize YouTube API: {e}")
            self.youtube = None

    def rotate_api_key(self) -> None:
        """Rotate to the next available API key."""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        self.initialize_client()
        logger.info(f"Rotated to API key index: {self.current_key_index}")

    def handle_quota_exceeded(self) -> bool:
        """Handle quota exceeded error by rotating API key."""
        if len(self.api_keys) == 1:
            logger.error("No additional API keys available")
            return False
        
        self.rotate_api_key()
        return True

    def apply_rate_limiting(self) -> None:
        """Apply rate limiting to prevent quota exhaustion."""
        elapsed = datetime.now() - self.last_request_time
        if elapsed.total_seconds() < 0.1:  # Max 10 requests per second
            time.sleep(0.1 - elapsed.total_seconds())
        self.last_request_time = datetime.now()

    def get_video_metadata(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch video metadata with error handling and retries.
        """
        if not self.youtube:
            raise RuntimeError("YouTube API client not initialized")

        retries = len(self.api_keys)
        while retries > 0:
            try:
                self.apply_rate_limiting()
                request = self.youtube.videos().list(
                    part="snippet,contentDetails,statistics",
                    id=video_id
                )
                response = request.execute()
                
                if not response.get('items'):
                    logger.warning(f"No metadata found for video ID: {video_id}")
                    return None
                
                return response['items'][0]

            except HttpError as e:
                if e.resp.status == 403:  # Quota exceeded
                    logger.warning("Quota exceeded, attempting to rotate API key")
                    if self.handle_quota_exceeded():
                        retries -= 1
                        continue
                    break
                else:
                    logger.error(f"HTTP error occurred: {e}")
                    break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                break
            
        return None

    def get_video_comments(self, video_id: str, max_results: int = 100) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch video comments with pagination, error handling, and retries.
        """
        if not self.youtube:
            raise RuntimeError("YouTube API client not initialized")

        comments = []
        next_page_token = None
        retries = len(self.api_keys)

        while retries > 0 and (len(comments) < max_results):
            try:
                self.apply_rate_limiting()
                request = self.youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    maxResults=min(100, max_results - len(comments)),
                    pageToken=next_page_token,
                    textFormat="plainText"
                )
                response = request.execute()

                for item in response.get('items', []):
                    comment = {
                        'text': item['snippet']['topLevelComment']['snippet']['textDisplay'],
                        'author': item['snippet']['topLevelComment']['snippet']['authorDisplayName'],
                        'timestamp': item['snippet']['topLevelComment']['snippet']['publishedAt'],
                        'likes': item['snippet']['topLevelComment']['snippet']['likeCount']
                    }
                    comments.append(comment)

                next_page_token = response.get('nextPageToken')
                if not next_page_token or len(comments) >= max_results:
                    break

            except HttpError as e:
                if e.resp.status == 403:  # Quota exceeded
                    logger.warning("Quota exceeded, attempting to rotate API key")
                    if self.handle_quota_exceeded():
                        retries -= 1
                        continue
                    break
                elif e.resp.status == 404:
                    logger.warning(f"Video not found: {video_id}")
                    break
                else:
                    logger.error(f"HTTP error occurred: {e}")
                    break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                break

        return comments if comments else None

def create_youtube_client(api_keys: Optional[List[str]] = None) -> Optional[YouTubeAPI]:
    """
    Create a YouTube API client instance.
    """
    if not api_keys:
        api_key = os.environ.get('YOUTUBE_API_KEY')
        if not api_key:
            logger.error("No YouTube API key found in environment variables")
            return None
        api_keys = [api_key]
    
    return YouTubeAPI(api_keys)