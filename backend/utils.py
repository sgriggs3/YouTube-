import re

def extract_video_id(url):
    """
    Extracts the video ID from a YouTube URL.
    Supports various URL formats (e.g., watch, embed, shorts, youtu.be).

    Args:
        url: The YouTube URL.

    Returns:
        The video ID (string) or None if the URL is invalid.
    """
    match = re.search(r"(?:v=|\/embed\/|\/watch\?v=|\/shorts\/|youtu\.be\/)([\w-]{11})", url)
    return match.group(1) if match else None