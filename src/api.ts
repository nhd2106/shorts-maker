import { GenerateInitialResponse, GenerateStatusResponse } from "@/types/api";
import { invoke } from "@tauri-apps/api/core";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

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
export const startSidecarAction = async () => {
  try {
    await invoke("start_sidecar");
    return;
  } catch (err) {
    console.error(`[ui] Failed to start sidecar. ${err}`);
  }
};
