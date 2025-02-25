import { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertVideoSchema } from "@shared/schema";
import { testYouTubeAPI, getVideoDetails, getVideoSubtitles } from "./youtube-api";

async function fetchSubtitles(videoId: string) {
  try {
    // Get video details
    const { title } = await getVideoDetails(videoId);
    console.log('Successfully fetched video title:', title);

    // Get subtitles
    console.log('Fetching transcripts for video:', videoId);
    const { subtitles, timestamps } = await getVideoSubtitles(videoId);

    return {
      title,
      subtitles,
      timestamps
    };
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express) {
  // Verify YouTube API access on startup
  try {
    await testYouTubeAPI();
  } catch (error) {
    console.error('Failed to verify YouTube API access:', error);
    process.exit(1);
  }

  // Process video route should come before the parameterized route
  app.get("/api/videos/process", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Video ID is required" });
      }

      // Check if we already have this video
      const existing = await storage.getVideo(id);
      if (existing) {
        return res.json(existing);
      }

      const { title, subtitles, timestamps } = await fetchSubtitles(id);
      const video = await storage.createVideo({
        youtubeId: id,
        title,
        subtitles,
        timestamps
      });
      return res.json(video);
    } catch (error) {
      console.error('Error processing video:', error);
      return res.status(500).json({ 
        message: "Failed to process video",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/videos/:youtubeId", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.youtubeId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      return res.json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      return res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const video = insertVideoSchema.parse(req.body);
      const created = await storage.createVideo(video);
      return res.json(created);
    } catch (error) {
      console.error('Error creating video:', error);
      return res.status(400).json({ 
        message: "Invalid video data",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return createServer(app);
}