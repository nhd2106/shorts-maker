import { GenerateInitialResponse, GenerateStatusResponse } from "@/types/api";
import { invoke } from "@tauri-apps/api/core";
// import { Command } from "@tauri-apps/plugin-shell";
import { listen } from "@tauri-apps/api/event";
import axios from "axios";

// const message = "tauri";

const API_BASE_URL = "https://shorts.duoc95.com";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function generateVideo(data: {
  idea: string;
  format: "shorts" | "normal";
  tts_model: "edge" | "openai" | "google" | "vixtts";
  voice:
    | "vi-VN-NamMinhNeural"
    | "vi-VN-ThanhMinhNeural"
    | "vi-VN-ThuyTrangNeural"
    | "alloy"
    | "nova"
    | "shimmer"
    | "echo"
    | "fable"
    | "vivos";
  api_keys: {
    openai?: string;
    elevenlabs?: string;
    together?: string;
  };
}): Promise<GenerateInitialResponse> {
  try {
    const { data: response } = await api.post("/api/generate", {
      ...data,
      caption_effect: "karaoke",
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to generate video"
      );
    }
    throw error;
  }
}

export async function checkGenerationStatus(
  requestId: string
): Promise<GenerateStatusResponse> {
  try {
    const { data } = await api.get(`/api/status/${requestId}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to check generation status"
      );
    }
    throw error;
  }
}

export function getDownloadUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function getAvailableModels() {
  try {
    const { data } = await api.get("/api/models");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to get available models"
      );
    }
    throw error;
  }
}

export const deleteVideo = async (requestId: string) => {
  const { data } = await api.delete(`/api/content/${requestId}`);
  return data;
};

export async function prepareVideoData(data: {
  idea: string;
  video_format?: "shorts" | "normal";
  tts_model?: "edge" | "openai" | "google" | "vixtts";
  voice?:
    | "vi-VN-NamMinhNeural"
    | "vi-VN-ThanhMinhNeural"
    | "vi-VN-ThuyTrangNeural"
    | "alloy"
    | "nova"
    | "shimmer"
    | "echo"
    | "fable"
    | "vivos";
}): Promise<GenerateInitialResponse> {
  try {
    const { data: response } = await api.post("/api/prepare-video-data", {
      ...data,
      video_format: data.video_format || "shorts",
      tts_model: data.tts_model || "edge",
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to prepare video data"
      );
    }
    throw error;
  }
}

// Add a flag to track if sidecar is starting
let isSidecarStarting = false;
let startTimeout: NodeJS.Timeout | null = null;

export const startSidecarAction = async (
  onStatusUpdate: (status: string) => void
) => {
  // Clear any existing timeout
  if (startTimeout) {
    clearTimeout(startTimeout);
    startTimeout = null;
  }

  // Prevent multiple simultaneous start attempts
  if (isSidecarStarting) {
    console.log("Sidecar start already in progress");
    onStatusUpdate("Sidecar start already in progress...");
    return () => {}; // Return empty cleanup
  }

  isSidecarStarting = true;
  const eventCleanupFunctions: (() => void)[] = [];

  try {
    console.log("Starting sidecar process...");
    onStatusUpdate("Initializing sidecar process...");

    // First try to shutdown any existing sidecar
    try {
      await shutdownSidecarAction();
    } catch (err) {
      console.log("No existing sidecar to shutdown", err);
    }

    // Set up a timeout to reset the starting flag if startup takes too long
    startTimeout = setTimeout(() => {
      if (isSidecarStarting) {
        isSidecarStarting = false;
        onStatusUpdate("Error: Sidecar startup timed out");
        eventCleanupFunctions.forEach((cleanup) => cleanup());
      }
    }, 30000); // 30 second timeout

    // Listen for different sidecar events
    const unlistenTimestamp = await listen<string>(
      "sidecar-timestamp",
      (event) => {
        console.log("Received timestamp:", event.payload);
        onStatusUpdate(`Last update: ${event.payload}`);
      }
    );
    eventCleanupFunctions.push(unlistenTimestamp);

    const unlistenMessage = await listen<string>("sidecar-message", (event) => {
      console.log("Received message:", event.payload);
      onStatusUpdate(event.payload);
    });
    eventCleanupFunctions.push(unlistenMessage);

    const unlistenError = await listen<string>("sidecar-error", (event) => {
      console.error("Sidecar error:", event.payload);
      onStatusUpdate(`Error: ${event.payload}`);
      if (event.payload.includes("Failed to execute script")) {
        // Critical error - cleanup and reset
        isSidecarStarting = false;
        if (startTimeout) {
          clearTimeout(startTimeout);
          startTimeout = null;
        }
        eventCleanupFunctions.forEach((cleanup) => cleanup());
      }
    });
    eventCleanupFunctions.push(unlistenError);

    // Start the sidecar
    await invoke<void>("start_sidecar");

    // Wait a bit to ensure the sidecar has started
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Sidecar process started");
    onStatusUpdate("Sidecar process started successfully");

    // Clear the timeout since we started successfully
    if (startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = null;
    }

    isSidecarStarting = false;

    // Return cleanup function
    return () => {
      if (startTimeout) {
        clearTimeout(startTimeout);
        startTimeout = null;
      }
      eventCleanupFunctions.forEach((cleanup) => cleanup());
      isSidecarStarting = false;
    };
  } catch (err) {
    // Clean up on error
    if (startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = null;
    }
    eventCleanupFunctions.forEach((cleanup) => cleanup());

    console.error(`[ui] Failed to start sidecar. ${err}`);
    onStatusUpdate(`Error: Failed to start sidecar: ${err}`);
    isSidecarStarting = false;
    throw err;
  }
};

export const shutdownSidecarAction = async () => {
  try {
    // Clear any existing timeout
    if (startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = null;
    }

    const response = await invoke<string>("shutdown_sidecar");
    console.log("Sidecar shutdown response:", response);
    isSidecarStarting = false;
    return response;
  } catch (err) {
    console.error(`[ui] Failed to shutdown sidecar. ${err}`);
    isSidecarStarting = false;
    throw err;
  }
};

// export const startSidecarAction = async () => {
//   const command = Command.sidecar("binaries/app/my-sidecar", ["ping", message]);
//   const output = await command.execute();
//   return output.stdout;
// };

export const toggleFullscreen = async () => {
  try {
    await invoke<void>("toggle_fullscreen");
  } catch (err) {
    console.error(`[ui] Failed to toggle fullscreen. ${err}`);
    throw err;
  }
};
