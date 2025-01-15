export type GenerationStatus = 
  | "idle"
  | "pending"
  | "generating_content"
  | "generating_audio"
  | "generating_images"
  | "generating_video"
  | "completed"
  | "failed";

export interface GenerateInitialResponse {
  request_id: string;
  status: GenerationStatus;
  message: string;
}

export interface GenerateStatusResponse {
  status: GenerationStatus;
  progress: number;
  stage_description: string;
  error?: string;
  result?: GenerateResponse;
}

export interface GenerateResponse {
  video: {
    filename: string;
    url: string;
  };
  thumbnail: {
    filename: string;
    url: string;
  };
  content: {
    filename: string;
    url: string;
  };
  metadata: {
    format: "shorts" | "normal";
    tts_model: string;
    voice: string;
  };
}

export type GenerateError = {
  error: string;
};

export interface PrepareVideoDataResponse {
  request_id: string;
  content: {
    title: string;
    script: string;
    hashtags: string[];
  };
  paths: {
    audio: string;
    background_images: string[];
  };
  video_settings: {
    format: "shorts" | "normal";
    width: number;
    height: number;
    duration: number;
  };
  timings: {
    word: string;
    start: number;
    end: number;
  }[];
  title: {
    text: string;
    position: {
      x: string;
      y: number;
    };
  };
}
