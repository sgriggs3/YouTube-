import googleapiclient.discovery
import googleapiclient.errors
import json
import os

# Load API key from environment variables
api_key = os.environ.get('YOUTUBE_API_KEY')

if not api_key:
    raise ValueError('YOUTUBE_API_KEY environment variable not set.')

youtube = googleapiclient.discovery.build('youtube', 'v3', developerKey=api_key)


def fetch_video_metadata(video_id):
    """Fetches metadata for a given video ID.

    Args:
        video_id: The ID of the YouTube video.

    Returns:
        A dictionary containing video metadata, or None if an error occurs.
    """
    try:
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=video_id
        )
        response = request.execute()

        if 'items' in response and response['items']:
            return response['items'][0]
        else:
            return None

    except googleapiclient.errors.HttpError as error:
        handle_api_errors(error)
        return None


def fetch_comments(video_id, max_results=100):
    """Fetches comments for a given video ID.

    Args:
        video_id: The ID of the YouTube video.
        max_results: The maximum number of comments to fetch.

    Returns:
        A list of comments, or None if an error occurs.
    """
    comments = []
    try:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            textFormat="plainText",
            maxResults=max_results
        )
        response = request.execute()

        while response:
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                comments.append(comment)

            if 'nextPageToken' in response and len(comments) < max_results:
                next_page_token = response['nextPageToken']
                request = youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    textFormat="plainText",
                    pageToken=next_page_token,
                    maxResults=max_results - len(comments)
                )
                response = request.execute()
            else:
                break

    except googleapiclient.errors.HttpError as error:
        handle_api_errors(error)
        return None

    return comments


def fetch_transcript(video_id):
    """Fetches the transcript for a given video ID.

    Args:
        video_id: The ID of the YouTube video.

    Returns:
        A list of transcript entries, or None if an error occurs or no transcript is available.
    """
    # TODO: Implement fetching transcript (if available)
    pass


def store_data(data, filename):
    """Stores data to a JSON file.

    Args:
        data: The data to store (e.g., video metadata, comments).
        filename: The name of the file to store the data in.
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)


def handle_api_errors(error):
    """Handles YouTube API errors.

    Args:
        error: The API error.
    """
    print(f"An API error occurred: {error}")
