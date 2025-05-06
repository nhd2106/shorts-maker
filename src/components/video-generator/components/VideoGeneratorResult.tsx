import { GenerateResponse, GenerationStatus } from "@/types/api";
import VideoPlayer from "@/components/VideoPlayer";
import ScriptContent from "@/components/ScriptContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "motion/react";
import { AlertCircle, RefreshCcw, Loader2 } from "lucide-react";
import { API_BASE_URL, getDownloadUrl } from "@/api";
import { Video, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface VideoGeneratorResultProps {
  status: GenerationStatus;
  error: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: GenerateResponse | any;
  progress: number;
  stageDescription: string;
  onRetry: () => void;
  selectedFormat: "shorts" | "normal";
}

export function VideoGeneratorResult({
  status,
  error,
  result,
  progress,
  stageDescription,
  onRetry,
  selectedFormat,
}: VideoGeneratorResultProps) {
  const [title, setTitle] = useState("video");
  const [isRetrying, setIsRetrying] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  useEffect(() => {
    // Reset retrying state when status changes
    if (status !== "failed") {
      setIsRetrying(false);
    }
  }, [status]);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        if (result?.content) {
          if (result.content.title) {
            setTitle(result.content.title);
          }
        }
      } catch (err) {
        console.error("Error fetching title:", err);
        setTitle("video");
      }
    };
    fetchTitle();
  }, [result, status]);

  const handleVideoBlobReady = useCallback((blob: Blob) => {
    setVideoBlob(blob);
  }, []);

  const triggerDownload = (blob: Blob, filename: string) => {
    let blobUrl: string | null = null;
    try {
      blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Successfully downloaded ${filename}`);
    } catch (error) {
      console.error("Download trigger error:", error);
      toast.error(
        `Failed to download ${filename}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    }
  };

  const handleUrlDownload = async (url: string, filename: string) => {
    toast.info(`Starting download for ${filename}...`);
    try {
      const response = await fetch(getDownloadUrl(url));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      triggerDownload(blob, filename);
    } catch (error) {
      console.error("URL Download error:", error);
      toast.error(
        `Failed to download ${filename}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleVideoDownload = () => {
    if (!videoBlob) {
      toast.error("Video data is not ready yet. Please wait.");
      console.error("Video download attempted before blob was ready.");
      return;
    }
    const filename = `${title}.mp4`;
    toast.info(`Starting download for ${filename}...`);
    triggerDownload(videoBlob, filename);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    onRetry();
  };

  if (error) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Alert variant="destructive" className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="font-medium">Generation Failed</p>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </div>
        </Alert>
        <div className="flex gap-2">
          <Button
            onClick={handleRetry}
            className="gap-2"
            disabled={isRetrying || status === "generating_content"}
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (result && status === "completed") {
    const videoUrl = result.video.url.startsWith("http")
      ? result.video.url
      : getDownloadUrl(result.video.url);

    const thumbnailUrl = result.thumbnail?.url.startsWith("http")
      ? result.thumbnail.url
      : result.thumbnail?.url
      ? getDownloadUrl(result.thumbnail.url)
      : undefined;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className={`relative ${
              selectedFormat === "shorts" ? "aspect-[9/16]" : "aspect-[16/9]"
            }`}
          >
            <VideoPlayer
              src={videoUrl}
              poster={`${API_BASE_URL}${thumbnailUrl?.replace(
                "thumbnail",
                "video"
              )}`}
              onBlobReady={handleVideoBlobReady}
            />
            <Button
              onClick={handleVideoDownload}
              className="gap-2 w-full mt-5"
              disabled={!videoBlob}
            >
              <Video className="w-4 h-4" />
              Download Video
            </Button>
          </div>
          <div className="space-y-4">
            {result.content && (
              <Card className="p-4 h-full overflow-y-auto max-h-[600px]">
                <ScriptContent
                  title={title}
                  script={result.content.script}
                  hashtags={result.content.hashtags}
                />
                <Button
                  onClick={() =>
                    handleUrlDownload(result.content.url, `${title}.txt`)
                  }
                  variant="outline"
                  className="w-full gap-2 mt-4"
                >
                  <FileText className="w-4 h-4" />
                  Download Script
                </Button>
              </Card>
            )}
            {result.thumbnail && thumbnailUrl && (
              <Card className="p-4 space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={`${API_BASE_URL}${thumbnailUrl?.replace(
                      "thumbnail",
                      "video"
                    )}`}
                    alt="Thumbnail"
                    className="w-full h-full object-contain"
                    width={500}
                    height={500}
                  />
                </div>
                <Button
                  onClick={() =>
                    handleUrlDownload(
                      result.thumbnail.url,
                      `${title}-thumbnail.jpg`
                    )
                  }
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Download Thumbnail
                </Button>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (
    status === "pending" ||
    status === "generating_content" ||
    status === "generating_audio" ||
    status === "generating_images" ||
    status === "generating_video"
  ) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm text-muted-foreground w-10">
            {progress}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{stageDescription}</p>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Alert variant="destructive" className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="font-medium">Generation Failed</p>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </div>
        </Alert>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="gap-2"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4" />
              Retry Generation
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return null;
}
