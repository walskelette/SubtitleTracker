import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/youtube";

interface VideoPreviewProps {
  videoId: string;
  timestamp: number;
  subtitle: string;
  searchTerm: string;
}

// Add proper types for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height: string | number;
          width: string | number;
          videoId: string;
          playerVars?: {
            start?: number;
            autoplay?: 0 | 1;
            controls?: 0 | 1;
          };
        }
      ) => {
        destroy: () => void;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPreview({ videoId, timestamp, subtitle, searchTerm }: VideoPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Only create player when preview is shown
    if (showPreview && !playerRef.current) {
      const player = new window.YT.Player(`player-${timestamp}`, {
        height: '180',
        width: '320',
        videoId: videoId,
        playerVars: {
          start: timestamp,
          autoplay: 1,
          controls: 0,
        },
      });
      playerRef.current = player;
    }

    // Cleanup player when component unmounts or preview is hidden
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [showPreview, timestamp, videoId]);

  // Highlight search term in subtitle text
  const highlightedText = subtitle.replace(
    new RegExp(searchTerm, 'gi'),
    match => `<mark class="bg-yellow-200 dark:bg-yellow-800">${match}</mark>`
  );

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow duration-200"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <div className="flex items-start gap-4">
        <div className="w-[320px] h-[180px] bg-gray-100 rounded overflow-hidden">
          {showPreview ? (
            <div id={`player-${timestamp}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <a 
            href={`https://youtube.com/watch?v=${videoId}&t=${timestamp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-blue-600 hover:underline block"
          >
            {formatTimestamp(timestamp)}
          </a>
          <p 
            className="mt-2 text-gray-700 dark:text-gray-300 break-words"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      </div>
    </Card>
  );
}