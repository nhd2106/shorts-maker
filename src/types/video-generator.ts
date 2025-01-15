import { GenerateResponse, GenerationStatus } from "./api";

export type VoiceOption = 
  | "vi-VN-NamMinhNeural"
  | "vi-VN-ThanhMinhNeural"
  | "vi-VN-ThuyTrangNeural"
  | "alloy"
  | "nova"
  | "shimmer"
  | "echo"
  | "fable"
  | "vivos";

export type TTSModel = "edge" | "openai" | "google" | "vixtts";

export type FormData = {
  idea: string;
  videoFormat: "shorts" | "normal";
  voiceModel: TTSModel;
  voice: VoiceOption;
};

export type HistoryItem = {
  id: string;
  idea: string;
  timestamp: Date;
  status: GenerationStatus;
  format: "shorts" | "normal";
  result?: GenerateResponse;
  tts_model?: TTSModel;
  voice?: VoiceOption;
};
