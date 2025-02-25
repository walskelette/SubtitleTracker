import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoPreview } from "./video-preview";
import { getVideoId } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface FormData {
  url: string;
}

export function SubtitleSearch() {
  useEffect(() => {
    console.log('SubtitleSearch component mounted');
  }, []);

  const { toast } = useToast();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const { data: video, isLoading: isLoadingVideo } = useQuery<Video>({
    queryKey: ['/api/videos', videoId],
    enabled: !!videoId,
  });

  useEffect(() => {
    if (video) {
      console.log('Video data loaded:', video);
    }
  }, [video]);

  const processVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      console.log('Processing video URL:', url);
      const id = await getVideoId(url);
      if (!id) throw new Error("Invalid YouTube URL");

      try {
        // First check if we already have this video
        const response = await fetch(`/api/videos/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Found existing video:', data);
          setVideoId(id);
          return data;
        }

        // Process new video
        const processResponse = await fetch(`/api/videos/process?id=${id}`);
        if (!processResponse.ok) {
          const error = await processResponse.json();
          throw new Error(error.message || "Failed to process video");
        }

        const data = await processResponse.json();
        console.log('Successfully processed video:', data);
        setVideoId(id);
        return data;
      } catch (error) {
        console.error('Error processing video:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log('Form submitted with URL:', data.url);
    try {
      await processVideoMutation.mutateAsync(data.url);
    } catch (error) {
      // Error is already handled by mutation's onError
    }
  });

  const filteredSubtitles = video && searchTerm
    ? video.subtitles
        .map((subtitle, i) => ({ subtitle, timestamp: video.timestamps[i] }))
        .filter(({ subtitle }) => 
          subtitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  useEffect(() => {
    if (searchTerm) {
      console.log('Search results:', filteredSubtitles);
    }
  }, [searchTerm, filteredSubtitles]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              {...register("url", { required: "YouTube URL is required" })}
              placeholder="Paste YouTube URL here..."
              className="w-full"
              disabled={processVideoMutation.isPending}
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>
          <Button 
            type="submit"
            disabled={processVideoMutation.isPending}
            className="w-full sm:w-auto"
          >
            {processVideoMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Load Video"
            )}
          </Button>
        </form>
      </Card>

      {video && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search in subtitles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            {searchTerm && (
              <p className="text-sm text-gray-500">
                Found {filteredSubtitles.length} matches
              </p>
            )}

            {filteredSubtitles.map(({ subtitle, timestamp }, i) => (
              <VideoPreview
                key={`${timestamp}-${i}`}
                videoId={video.youtubeId}
                timestamp={timestamp}
                subtitle={subtitle}
                searchTerm={searchTerm}
              />
            ))}

            {searchTerm && filteredSubtitles.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No matches found for "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}