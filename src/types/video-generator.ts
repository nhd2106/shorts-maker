import { GenerateResponse, GenerationStatus } from "./api";

export type VoiceOption =
  | "vi-VN-NamMinhNeural"
  | "vi-VN-ThanhMinhNeural"
  | "vi-VN-ThuyTrangNeural"
  | "en-US-AriaNeural"
  | "en-US-EricNeural"
  | "en-US-ChristopherNeural"
  | "en-US-GuyNeural"
  | "en-US-JennyNeural"
  | "en-US-MichelleNeural"
  | "en-US-RogerNeural"
  | "en-US-SteffanNeural"
  | "alloy"
  | "nova"
  | "shimmer"
  | "echo"
  | "fable"
  | "vivos"
  | "onyx";

export type TTSModel = "edge" | "openai" | "google" | "vixtts";

export interface FormData {
  idea: string;
  videoFormat: "shorts" | "normal";
  voiceModel: TTSModel;
  voice: VoiceOption;
  imageProvider: "google" | "openai";
  backgroundMusic: string;
}

export type HistoryItem = {
  id: string;
  idea: string;
  timestamp: Date;
  status: GenerationStatus;
  format: "shorts" | "normal";
  result?: GenerateResponse;
  tts_model?: TTSModel;
  voice?: VoiceOption;
  imageProvider?: "google" | "openai";
  backgroundMusic?: string;
};

// export interface GenerateScriptResponse {
//   // Define fields later if needed
// }

// export interface GenerateAudioResponse {
//   // Define fields later if needed
// }
