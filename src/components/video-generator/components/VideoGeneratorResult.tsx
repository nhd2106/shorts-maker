import { GenerateResponse, GenerationStatus } from "@/types/api";
import VideoPlayer from "@/components/VideoPlayer";
import ScriptContent from "@/components/ScriptContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "motion/react";
import { AlertCircle, RefreshCcw, Loader2 } from "lucide-react";
import { getDownloadUrl } from "@/api";
import { Video, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BaseDirectory, downloadDir } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

function parseContent(content: string) {
  try {
    // Remove any BOM characters that might be present
    content = content.replace(/^\uFEFF/, "");

    // Split content by newlines and filter out empty lines
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error("Content is empty");
    }

    // Find the title line (starts with "title:")
    const titleLine = lines.find((line) =>
      line.toLowerCase().startsWith("title:")
    );
    if (!titleLine) {
      throw new Error("No title found");
    }
    const title = titleLine.substring("title:".length).trim();

    // Find the script section (starts with "script:")
    const scriptStartIndex = lines.findIndex((line) =>
      line.toLowerCase().startsWith("script:")
    );
    if (scriptStartIndex === -1) {
      throw new Error("No script found");
    }

    // Get all lines after "script:" until the end or until hashtags
    const scriptLines = lines
      .slice(scriptStartIndex + 1)
      .filter((line) => line.trim() && !line.includes("#"));

    const script = scriptLines.join("\n").trim();

    // Find hashtags if any
    const hashtagLine = lines.find((line) => line.includes("#")) || "";
    const hashtags = hashtagLine
      .split(" ")
      .filter((word) => word.startsWith("#"))
      .map((tag) => tag.trim());

    return {
      title,
      script,
      hashtags: hashtags.length > 0 ? hashtags : [],
    };
  } catch (err) {
    console.log("Error parsing content:", err);
    return null;
  }
}

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
  console.log(result);

  useEffect(() => {
    // Reset retrying state when status changes
    if (status !== "failed") {
      setIsRetrying(false);
    }
  }, [status]);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        if (result?.content?.url && status === "completed") {
          const response = await fetch(getDownloadUrl(result.content.url));
          const text = await response.text();
          const parsed = parseContent(text);
          if (parsed) {
            setTitle(parsed.title);
          }
        }
      } catch (err) {
        console.error("Error fetching title:", err);
        setTitle("video");
      }
    };
    fetchTitle();
  }, [result?.content?.url, status]);

  const handleDownload = async (url: string, filename?: string) => {
    try {
      if (!filename) return;

      const response = await fetch(getDownloadUrl(url));
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const path = await save({
        defaultPath: await downloadDir(),
        title: "Save File",
        filters: [
          {
            name: filename,
            extensions: [".mp4"],
          },
        ],
      });
      if (!path) return;
      const filePath = await join(path, "video-generator");
      await writeFile(filePath, uint8Array, {
        baseDir: BaseDirectory.Download,
      })
        .then(() => {
          toast.success(`Successfully downloaded ${filename} to Desktop`);
        })
        .catch((err) => {
          console.error("Download error:", err);
          toast.error(`Failed to download ${filename}`);
        });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Failed to download ${filename}`);
    }
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
                  title={title}
                  script={result.content.script}
                  hashtags={result.content.hashtags}
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
