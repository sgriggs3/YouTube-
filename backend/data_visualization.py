import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import io
import base64
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def create_wordcloud(comments: List[Dict[str, Any]], output_file: str) -> None:
    """Generate an interactive wordcloud visualization from comments."""
    try:
        # Extract comment texts and join them
        text = ' '.join([comment['text'] for comment in comments])
        
        # Generate wordcloud
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='white',
            max_words=100
        ).generate(text)
        
        # Convert to base64 for Plotly
        img_buffer = io.BytesIO()
        wordcloud.to_image().save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Create Plotly figure
        fig = go.Figure()
        fig.add_layout_image(
            dict(
                source=f'data:image/png;base64,{img_str}',
                x=0,
                y=0,
                sizex=1,
                sizey=1,
                xref="paper",
                yref="paper",
                sizing="stretch"
            )
        )
        
        fig.update_layout(
            title="Comment Word Cloud",
            showlegend=False,
            width=800,
            height=400
        )
        
        fig.write_html(output_file)
        
    except Exception as e:
        logger.error(f"Error creating wordcloud: {e}")
        raise

def create_sentiment_distribution(sentiment_results: Dict[str, Any], output_file: str) -> None:
    """Create an interactive sentiment distribution visualization."""
    try:
        # Extract sentiment scores
        overall_stats = sentiment_results['overall_stats']
        distribution = overall_stats['sentiment_distribution']
        
        # Create figure
        fig = go.Figure(data=[
            go.Bar(
                x=list(distribution.keys()),
                y=list(distribution.values()),
                marker_color=['#2ecc71', '#95a5a6', '#e74c3c']  # Colors for positive, neutral, negative
            )
        ])
        
        fig.update_layout(
            title="Sentiment Distribution",
            xaxis_title="Sentiment",
            yaxis_title="Percentage",
            yaxis_tickformat=',.1%',
            showlegend=False
        )
        
        # Add average sentiment indicator
        fig.add_shape(
            type="line",
            x0=overall_stats['average_sentiment'],
            x1=overall_stats['average_sentiment'],
            y0=0,
            y1=max(distribution.values()),
            line=dict(color="red", width=2, dash="dash")
        )
        
        fig.write_html(output_file)
        
    except Exception as e:
        logger.error(f"Error creating sentiment distribution: {e}")
        raise

def create_engagement_visualization(metadata: Dict[str, Any], output_file: str) -> None:
    """Create an interactive visualization of video engagement metrics."""
    try:
        # Extract engagement metrics
        stats = metadata.get('statistics', {})
        metrics = {
            'Views': int(stats.get('viewCount', 0)),
            'Likes': int(stats.get('likeCount', 0)),
            'Comments': int(stats.get('commentCount', 0))
        }
        
        # Create subplots for different metrics
        fig = make_subplots(
            rows=1, cols=2,
            specs=[[{"type": "bar"}, {"type": "pie"}]],
            subplot_titles=("Engagement Metrics", "Engagement Distribution")
        )
        
        # Bar chart
        fig.add_trace(
            go.Bar(
                x=list(metrics.keys()),
                y=list(metrics.values()),
                marker_color=['#3498db', '#2ecc71', '#9b59b6']
            ),
            row=1, col=1
        )
        
        # Pie chart
        fig.add_trace(
            go.Pie(
                labels=list(metrics.keys()),
                values=list(metrics.values()),
                textinfo='label+percent'
            ),
            row=1, col=2
        )
        
        fig.update_layout(
            title="Video Engagement Analysis",
            showlegend=False,
            height=500
        )
        
        fig.write_html(output_file)
        
    except Exception as e:
        logger.error(f"Error creating engagement visualization: {e}")
        raise

def create_sentiment_trends_visualization(trends: List[Dict[str, Any]], output_file: str) -> None:
    """Create an interactive visualization of sentiment trends over time."""
    try:
        df = pd.DataFrame(trends)
        
        fig = go.Figure()
        
        # Add sentiment trend line
        fig.add_trace(
            go.Scatter(
                x=df['timestamp'],
                y=df['average_sentiment'],
                mode='lines+markers',
                name='Average Sentiment',
                line=dict(color='#2980b9')
            )
        )
        
        # Add comment volume as area plot
        fig.add_trace(
            go.Scatter(
                x=df['timestamp'],
                y=df['num_comments'],
                name='Number of Comments',
                fill='tozeroy',
                line=dict(color='#3498db', width=0.5),
                fillcolor='rgba(52, 152, 219, 0.2)'
            )
        )
        
        fig.update_layout(
            title="Sentiment Trends Over Time",
            xaxis_title="Time",
            yaxis_title="Sentiment Score",
            hovermode='x unified',
            showlegend=True
        )
        
        # Add second y-axis for comment volume
        fig.update_layout(
            yaxis2=dict(
                title="Number of Comments",
                overlaying="y",
                side="right"
            )
        )
        
        fig.write_html(output_file)
        
    except Exception as e:
        logger.error(f"Error creating sentiment trends visualization: {e}")
        raise