import { videos, type Video, type InsertVideo } from "@shared/schema";

export interface IStorage {
  getVideo(youtubeId: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private currentId: number;

  constructor() {
    this.videos = new Map();
    this.currentId = 1;
  }

  async getVideo(youtubeId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.youtubeId === youtubeId
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentId++;
    const video: Video = { ...insertVideo, id };
    this.videos.set(video.youtubeId, video);
    return video;
  }
}

export const storage = new MemStorage();
