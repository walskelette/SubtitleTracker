import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const youtube = google.youtube('v3');

export async function testYouTubeAPI() {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    // Test video metadata fetch
    const response = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      id: ['dQw4w9WgXcQ'] // Known video ID for testing
    });

    if (!response.data.items?.length) {
      throw new Error('YouTube API test failed: Could not fetch video data');
    }

    // Test subtitle fetch
    try {
      const transcripts = await YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ');
      if (!transcripts || transcripts.length === 0) {
        throw new Error('YouTube API test failed: Could not fetch video subtitles');
      }
      console.log('YouTube API test passed: Successfully fetched video data and subtitles');
    } catch (error) {
      console.error('YouTube API subtitle test failed:', error);
      throw new Error('YouTube API test failed: Could not fetch video subtitles');
    }

    return true;
  } catch (error) {
    console.error('YouTube API test failed:', error);
    throw error;
  }
}

export async function getVideoDetails(videoId: string) {
  const videoResponse = await youtube.videos.list({
    key: process.env.YOUTUBE_API_KEY,
    part: ['snippet'],
    id: [videoId]
  });

  if (!videoResponse.data.items?.length) {
    throw new Error('Video not found');
  }

  return {
    title: videoResponse.data.items[0].snippet?.title ?? 'Untitled Video',
    description: videoResponse.data.items[0].snippet?.description ?? ''
  };
}

export async function getVideoSubtitles(videoId: string) {
  try {
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptResponse || transcriptResponse.length === 0) {
      throw new Error('No subtitles available for this video');
    }

    return {
      subtitles: transcriptResponse.map((item: { text: string }) => item.text),
      timestamps: transcriptResponse.map((item: { offset: number }) => Math.floor(item.offset / 1000))
    };
  } catch (error) {
    console.error('Failed to fetch subtitles:', error);
    throw error;
  }
}