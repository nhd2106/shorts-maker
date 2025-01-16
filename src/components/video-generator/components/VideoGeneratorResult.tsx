import { GenerateResponse, GenerationStatus } from "@/types/api";
import VideoPlayer from "@/components/VideoPlayer";
import ScriptContent from "@/components/ScriptContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "motion/react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { getDownloadUrl } from "@/api";
import { RefreshCw, Video, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoGeneratorResultProps {
  status: GenerationStatus;
  error: string | null;
  result: GenerateResponse | null;
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

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        if (result?.content?.url && status === "completed") {
          const response = await fetch(result.content.url);
          const text = await response.text();
          const firstLine = text.split("\n")[0].trim();
          setTitle(
            firstLine
              .toLowerCase()
              .replace(/[^a-z0-9-\s]/g, "")
              .replace(/\s+/g, "-") || "video"
          );
        }
      } catch (err) {
        console.error("Error fetching title:", err);
      }
    };
    fetchTitle();
  }, [result?.content?.url, status]);

  const handleDownload = async (url: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = getDownloadUrl(url);
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // console.log(status, error);

  if (error) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (result && status === "completed") {
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
              src={
                result.video.url.startsWith("http")
                  ? result.video.url
                  : getDownloadUrl(result.video.url)
              }
            />
          </div>
          <div className="space-y-4">
            {result.content && (
              <Card className="p-4 h-full overflow-y-auto max-h-[600px]">
                <ScriptContent
                  content={{
                    filename: result.content.filename,
                    url: result.content.url.startsWith("http")
                      ? result.content.url
                      : getDownloadUrl(result.content.url),
                  }}
                />
                <Button
                  onClick={() =>
                    handleDownload(result.content.url, `${title}.txt`)
                  }
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download Script
                </Button>
              </Card>
            )}
            {result.thumbnail && (
              <Card className="p-4 space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={
                      result.thumbnail.url.startsWith("http")
                        ? result.thumbnail.url
                        : getDownloadUrl(result.thumbnail.url)
                    }
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </div>
                <Button
                  onClick={() =>
                    handleDownload(
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
        <Button
          onClick={() => handleDownload(result.video.url, `${title}.mp4`)}
          className="w-full gap-2"
        >
          <Video className="w-4 h-4" />
          Download Video
        </Button>
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
      <div className="space-y-4">
        <div className="flex items-start gap-4 text-destructive">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium">Generation Failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Retry Generation
        </Button>
      </div>
    );
  }

  return null;
}
