from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def get_video_details(youtube, video_id):
    """Fetches video details from the YouTube API."""
    try:
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=video_id
        )
        response = request.execute()
        return response
    except HttpError as e:
        print(f"An error occurred: {e}")
        return None


def get_comments(youtube, video_id):
    """Fetches comments from the YouTube API."""
    comments = []
    try:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            textFormat="plainText"
        )
        response = request.execute()

        while response:
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                comments.append(comment)

            if 'nextPageToken' in response:
                request = youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    textFormat="plainText",
                    pageToken=response['nextPageToken']
                )
                response = request.execute()
            else:
                break

        return comments
    except HttpError as e:
        print(f"An error occurred: {e}")
        return None


def youtube_api_init(api_key):
    """Initializes the YouTube API client."""
    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        return youtube
    except Exception as e:
        print(f"Failed to initialize YouTube API: {e}")
        return None