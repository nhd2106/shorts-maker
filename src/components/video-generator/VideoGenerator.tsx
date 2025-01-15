import { useState, useEffect, useRef, useCallback } from "react";
import { checkGenerationStatus, generateVideo, prepareVideoData } from "@/api";
import {
  GenerateResponse,
  GenerationStatus,
  GenerateStatusResponse,
  GenerateInitialResponse,
} from "@/types/api";
import { FormData, HistoryItem } from "@/types/video-generator";
import { VideoGeneratorForm } from "./components/VideoGeneratorForm";
import { VideoGeneratorResult } from "./components/VideoGeneratorResult";
import { Card } from "@/components/ui/card";
import {
  loadHistoryFromLocalStorage,
  saveHistoryToLocalStorage,
} from "@/utils/local-storage";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VideoGenerator() {
  // State for current generation
  const [status, setStatus] = useState<GenerationStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageDescription, setStageDescription] = useState("");

  // UI state
  const [selectedFormat, setSelectedFormat] = useState<"shorts" | "normal">(
    "shorts"
  );
  const [isFormVisible, setIsFormVisible] = useState(true);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // New state for image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const currentHistoryItemRef = useRef<HistoryItem | null>(null);
  const isInitialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const checkStatus = useCallback(
    async (requestId: string) => {
      if (currentRequestIdRef.current !== requestId) {
        return; // Stop polling if we've moved on to a new request
      }

      try {
        const statusResponse = await checkGenerationStatus(requestId);
        const data: GenerateStatusResponse = statusResponse;

        // Update status and progress
        setStatus(data.status);
        setProgress(data.progress);
        setStageDescription(data.stage_description);

        if (data.error) {
          setError(data.error);
          const updatedHistory = history.map((item) =>
            item.id === currentHistoryItemRef.current?.id
              ? { ...item, status: "failed" as GenerationStatus }
              : item
          );
          setHistory(updatedHistory);
          return;
        }

        if (data.result) {
          setResult(data.result);
          const updatedHistory = history.map((item) =>
            item.id === currentHistoryItemRef.current?.id
              ? {
                  ...item,
                  status: "completed" as GenerationStatus,
                  result: data.result,
                }
              : item
          );
          setHistory(updatedHistory);
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
          setTimeout(() => checkStatus(requestId), 60 * 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check status");
        setStatus("failed");
        const updatedHistory = history.map((item) =>
          item.id === currentHistoryItemRef.current?.id
            ? { ...item, status: "failed" as GenerationStatus }
            : item
        );
        setHistory(updatedHistory);
      }
    },
    [history]
  );

  const handleSubmit = async (formData: FormData) => {
    try {
      // Reset states
      setError(null);
      setStatus("generating_content");
      setProgress(0);
      setStageDescription("Initializing...");
      setSelectedFormat(formData.videoFormat);
      setIsFormVisible(false);
      setResult(null);
      const savedKeys = localStorage.getItem("api-keys");
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : null;
      const response = (await generateVideo({
        idea: formData.idea,
        format: formData.videoFormat,
        tts_model: formData.voiceModel,
        voice: formData.voice,
        api_keys: apiKeys,
      })) as GenerateInitialResponse;

      // Set current request ID and navigate to workspace
      currentRequestIdRef.current = response.request_id;
      currentHistoryItemRef.current = {
        id: response.request_id,
        idea: formData.idea,
        timestamp: new Date(),
        status: "generating_content",
        format: formData.videoFormat,
        tts_model: formData.voiceModel,
        voice: formData.voice,
      };

      // Add to history
      const newHistory = [
        currentHistoryItemRef.current,
        ...history,
      ] as HistoryItem[];
      saveHistoryToLocalStorage(newHistory);
      setHistory(newHistory);

      // Navigate to workspace page
      navigate(`/${response.request_id}`);
    } catch (err) {
      console.log("Error generating video:", err);
      setError(err instanceof Error ? err.message : "Failed to generate video");
      setStatus("failed");
      currentRequestIdRef.current = null;
    }
  };

  const handlePrepare = async (formData: FormData) => {
    try {
      // Reset states
      setError(null);
      setStatus("generating_content");
      setProgress(0);
      setStageDescription("Preparing video data...");
      setSelectedFormat(formData.videoFormat);
      setIsFormVisible(false);
      setResult(null);

      const response = await prepareVideoData({
        idea: formData.idea,
        video_format: formData.videoFormat,
        tts_model: formData.voiceModel,
        voice: formData.voice,
      });

      // Set current request ID and start status checking
      currentRequestIdRef.current = response.request_id;
      currentHistoryItemRef.current = {
        id: response.request_id,
        idea: formData.idea,
        timestamp: new Date(),
        status: "generating_content",
        format: formData.videoFormat,
        tts_model: formData.voiceModel,
        voice: formData.voice,
      };

      // Add to history
      const newHistory = [
        currentHistoryItemRef.current,
        ...history,
      ] as HistoryItem[];
      saveHistoryToLocalStorage(newHistory);
      setHistory(newHistory);

      // Start checking status
      setTimeout(() => checkStatus(response.request_id), 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to prepare video data"
      );
      setStatus("failed");
      setIsFormVisible(true);
    }
  };

  const handleRetry = async () => {
    const lastItem = history[0];
    if (lastItem && lastItem.status === "failed") {
      try {
        // Reset states
        setError(null);
        setStatus("generating_content");
        setProgress(0);
        setStageDescription("Retrying...");
        setResult(null);
        const savedKeys = localStorage.getItem("api-keys");
        const apiKeys = savedKeys ? JSON.parse(savedKeys) : null;

        const response = (await generateVideo({
          idea: lastItem.idea,
          format: lastItem.format,
          tts_model: lastItem.tts_model || "edge",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          voice: lastItem.voice as any,
          api_keys: apiKeys,
        })) as GenerateInitialResponse;

        // Set current request ID
        currentRequestIdRef.current = response.request_id;

        // Update history
        setHistory((prevHistory) =>
          prevHistory.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  id: response.request_id,
                  status: "generating_content",
                  timestamp: new Date(),
                }
              : item
          )
        );

        // Start polling for status
        checkStatus(response.request_id);
      } catch (err) {
        console.log("Error retrying:", err);
        setError(err instanceof Error ? err.message : "Failed to retry");
        setStatus("failed");
        currentRequestIdRef.current = null;
      }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxImages = selectedFormat === "shorts" ? 10 : 20;

    if (files.length + selectedImages.length > maxImages) {
      setImageError(
        `Maximum ${maxImages} images allowed for ${selectedFormat} format`
      );
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      setImageError("Only image files are allowed");
      return;
    }

    setImageError(null);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Load history from localStorage after mount
  useEffect(() => {
    if (!isInitialized.current) {
      const savedHistory = loadHistoryFromLocalStorage();
      setHistory(savedHistory);
      isInitialized.current = true;
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
      <div className="grid gap-6">
        {isFormVisible ? (
          <Card className="p-6">
            <div className="space-y-6">
              <VideoGeneratorForm
                onSubmit={handleSubmit}
                onPrepare={handlePrepare}
                status={status}
                setSelectedFormat={setSelectedFormat}
              />

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Upload Images</h3>
                  <span className="text-sm text-gray-500">
                    {selectedFormat === "shorts"
                      ? "Max 10 images"
                      : "Max 20 images"}
                  </span>
                </div>

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />

                <div className="flex flex-wrap gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                        width={96}
                        height={96}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}

                  {selectedImages.length <
                    (selectedFormat === "shorts" ? 10 : 20) && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-24 h-24 flex flex-col items-center justify-center gap-2"
                      onClick={triggerImageUpload}
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs">Add Image</span>
                    </Button>
                  )}
                </div>

                {imageError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <VideoGeneratorResult
            status={status}
            error={error}
            result={result}
            progress={progress}
            stageDescription={stageDescription}
            onRetry={() => {
              setIsFormVisible(true);
              // Reset any necessary state here
              handleRetry();
            }}
            selectedFormat={selectedFormat}
          />
        )}
      </div>
    </div>
  );
}
