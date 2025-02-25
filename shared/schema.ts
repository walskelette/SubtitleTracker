import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  subtitles: text("subtitles").array().notNull(),
  timestamps: integer("timestamps").array().notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  youtubeId: true,
  title: true,
  subtitles: true,
  timestamps: true,
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
