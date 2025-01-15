import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { checkGenerationStatus } from "@/api";
import { GenerateResponse, GenerationStatus } from "@/types/api";
import { VideoGeneratorResult } from "@/components/video-generator/components/VideoGeneratorResult";
import { Card } from "@/components/ui/card";
import {
  loadHistoryFromLocalStorage,
  saveHistoryToLocalStorage,
} from "@/utils/local-storage";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Workload() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [status, setStatus] = useState<GenerationStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageDescription, setStageDescription] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<"shorts" | "normal">(
    "shorts"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout>();

  const updateHistoryItem = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (itemId: string, updates: Partial<any>) => {
      const history = loadHistoryFromLocalStorage();
      const updatedHistory = history.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      saveHistoryToLocalStorage(updatedHistory);
    },
    []
  );

  const checkStatus = useCallback(async () => {
    try {
      const data = await checkGenerationStatus(id as string);

      // Update status and progress
      setStatus(data.status);
      setProgress(data.progress);
      setStageDescription(data.stage_description);

      if (data.error) {
        setError(data.error);
        // Update history item status
        updateHistoryItem(id as string, { status: "failed" });
        return;
      }

      if (data.result) {
        setResult(data.result);
        // Update history item with result
        updateHistoryItem(id as string, {
          status: "completed",
          result: data.result,
        });
        audioRef.current?.play().catch(console.log);
        return;
      }

      // Continue polling if still in progress
      if (
        [
          "generating_content",
          "generating_audio",
          "generating_images",
          "generating_video",
        ].includes(data.status)
      ) {
        pollingRef.current = setTimeout(() => checkStatus(), 1000 * 60);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status");
      setStatus("failed");
      updateHistoryItem(id as string, { status: "failed" });
    }
  }, [id, updateHistoryItem]);

  const handleRetry = useCallback(async () => {
    setError(null);
    setStatus("generating_content");
    setProgress(0);
    setStageDescription("Retrying...");
    setResult(null);
    await checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    audioRef.current = new Audio("/notification.wav");
    setError(null);
    // Load initial format from history
    const history = loadHistoryFromLocalStorage();
    const currentItem = history.find((item) => item.id === id);
    if (currentItem) {
      setSelectedFormat(currentItem.format);
      if (currentItem.result) {
        setResult(currentItem.result);
        setStatus("completed");
      } else if (currentItem.status === "failed") {
        setStatus("failed");
        setError(
          "This generation failed. You can retry by clicking the retry button."
        );
      } else {
        checkStatus();
      }
    }

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [id, checkStatus]);

  return (
    <div className="bg-background">
      <div className="container max-w-6xl mx-auto p-4 space-y-8">
        <Card className="w-full p-8 space-y-8 shadow-2xl rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-purple-100 dark:border-gray-700 relative overflow-hidden">
          <VideoGeneratorResult
            status={status}
            error={error}
            result={result}
            progress={progress}
            stageDescription={stageDescription}
            onRetry={handleRetry}
            selectedFormat={selectedFormat}
          />
        </Card>
      </div>
      <Button
        className="fixed bottom-10 right-10 z-50 "
        onClick={() => {
          navigate("/?new=true");
        }}
        size="icon"
      >
        <PlusIcon className="h-20 w-20" />
      </Button>
    </div>
  );
}
