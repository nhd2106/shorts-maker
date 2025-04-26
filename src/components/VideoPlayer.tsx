import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import axios from "axios";
import { API_BASE_URL } from "@/api";
interface VideoPlayerProps {
  src: string;
  poster?: string;
  format?: string;
  onBlobReady?: (blob: Blob) => void;
}

export default function VideoPlayer({
  src,
  poster,
  format = "shorts",
  onBlobReady,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError("No video source provided");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBlobUrl(null);

    let currentBlobUrl: string | null = null;

    const fetchVideoBlob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${src}`, {
          responseType: "blob",
        });

        const blob = response.data;
        currentBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(currentBlobUrl);
        if (onBlobReady) {
          onBlobReady(blob);
        }
      } catch (err) {
        console.error("Error fetching video blob:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load video data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoBlob();

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [src, onBlobReady]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.log);
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full absolute" />
          <div className="relative text-muted-foreground">Loading video...</div>
        </div>
      )}

      {error && !isLoading && (
        <Alert
          variant="destructive"
          className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {blobUrl && !isLoading && (
        <video
          key={blobUrl}
          ref={videoRef}
          className={`w-full h-full ${
            format === "normal" ? "aspect-video" : "aspect-[9/16]"
          } object-contain`}
          poster={poster}
          controls
          playsInline
          onClick={handleVideoClick}
        >
          <source src={blobUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
