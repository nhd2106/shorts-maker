import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  format?: string;
}

export default function VideoPlayer({
  src,
  poster,
  format = "shorts",
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;

    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      setIsLoading(false);
      setError(
        videoError
          ? `Failed to load video: ${videoError.message}`
          : "Failed to load video"
      );
      console.log("Video error:", videoError);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Reset video when src changes
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

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
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full absolute" />
          <div className="relative text-muted-foreground">Loading video...</div>
        </div>
      )}

      {error && (
        <Alert
          variant="destructive"
          className="absolute top-0 left-0 right-0 z-10"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full ${
          format === "normal" ? "aspect-video" : "aspect-[9/16]"
        } object-contain bg-black`}
        poster={poster}
        controls
        playsInline
        onClick={handleVideoClick}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
