/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormData } from "@/types/video-generator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Wand2, 
  Sparkles
} from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { VoiceSelector } from "./VoiceSelector";
import { useElevenLabsVoices } from "@/queries/elevenlabs";
import { ImageProvider } from "./ImageProvider";
import { MusicSelector } from "./MusicSelector";
import { CaptionStyleSelector } from "./CaptionStyleSelector";

interface VideoGeneratorFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  setSelectedFormat: (format: "shorts" | "normal") => void;
  status: string;
}

export function VideoGeneratorForm({
  onSubmit,
  setSelectedFormat,
  status,
}: VideoGeneratorFormProps) {
  const localApiKeys = localStorage.getItem("api-keys");
  const apiKeys = localApiKeys ? JSON.parse(localApiKeys) : {};

  const { data: voices } = useElevenLabsVoices(apiKeys.elevenlabs);
  const formSchema = z.object({
    idea: z.string().min(10, "Idea must be at least 10 characters long"),
    videoFormat: z.enum(["shorts", "normal"], {
      required_error: "Please select a video format",
    }),
    voiceModel: z.enum(["edge", "elevenlabs", "openai", "google", "vixtts"], {
      required_error: "Please select a voice model",
    }),
    voice: z.enum([
      "vi-VN-NamMinhNeural",
      "vi-VN-ThanhMinhNeural",
      "vi-VN-ThuyTrangNeural",
      "en-US-AriaNeural",
      "en-US-EricNeural",
      "en-US-ChristopherNeural",
      "en-US-GuyNeural",
      "en-US-JennyNeural",
      "en-US-MichelleNeural",
      "en-US-RogerNeural",
      "alloy",
      "nova",
      "shimmer",
      "echo",
      "fable",
      "vivos",
      "onyx",
      ...(voices?.voices.map((voice: any) => voice.voice_id) || []),
    ]),
    imageProvider: z.enum(["google", "openai"], {
      required_error: "Please select an image provider",
    }),
    backgroundMusic: z.string().optional(),
    captionStyle: z.string().optional(),
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoFormat: "shorts",
      voiceModel: "edge",
      voice: "vi-VN-NamMinhNeural",
      imageProvider: "google",
      backgroundMusic: "",
      captionStyle: "karaoke",
    },
  });

  const selectedFormat = watch("videoFormat");
  const selectedModel = watch("voiceModel");
  const selectedVoice = watch("voice");
  const selectedImageProvider = watch("imageProvider");
  const selectedMusic = watch("backgroundMusic");
  const selectedCaptionStyle = watch("captionStyle");

  const handleFormatSelect = (format: "shorts" | "normal") => {
    setValue("videoFormat", format);
    setSelectedFormat(format);
  };

  const handleModelSelect = (model: string) => {
    setValue("voiceModel", model as any);
    // Reset voice when model changes
    if (model === "edge") {
      setValue("voice", "vi-VN-NamMinhNeural");
    } else if (model === "openai") {
      setValue("voice", "alloy");
    }
  };

  const handleVoiceSelect = (voice: string) => {
    setValue("voice", voice as any);
  };

  const handleImageProviderSelect = (provider: string = "google") => {
    setValue("imageProvider", provider as any);
  };

  const handleMusicSelect = (music: string) => {
    setValue("backgroundMusic", music);
  };

  const handleCaptionStyleSelect = (style: string) => {
    setValue("captionStyle", style);
  };

  const generateIdeas = [
    "Create a video about the top 5 most fascinating scientific discoveries",
    "Make a tutorial on how to improve productivity with simple habits",
    "Share interesting facts about space exploration and future missions",
    "Explain complex tech concepts in simple terms",
    "Create a video about mindfulness and mental health tips",
  ];

  return (
    <div className="max-w-3xl mx-auto">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Video Idea */}
        <div className="space-y-2">
          <Label htmlFor="idea">Video Idea</Label>
          <Card className="p-4">
            <div className="space-y-3">
              
              <Textarea
                id="idea"
                placeholder="Enter your video idea..."
                className="min-h-[100px] resize-none"
                {...register("idea")}
              />
              
              {errors.idea && (
                <p className="text-sm text-red-500">
                  {errors.idea.message}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Quick ideas:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {generateIdeas.slice(0, 3).map((idea, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setValue("idea", idea)}
                  >
                    {idea.split(" ").slice(0, 5).join(" ")}...
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Format Selection */}
        <FormatSelector
          selectedFormat={selectedFormat}
          onFormatSelect={handleFormatSelect}
        />

        {/* Voice Selection */}
        <VoiceSelector
          selectedModel={selectedModel}
          selectedVoice={selectedVoice}
          onModelSelect={handleModelSelect}
          onVoiceSelect={handleVoiceSelect}
          elevenlabsVoices={voices?.voices}
        />

        {/* Image Provider */}
        <ImageProvider
          selectedProvider={selectedImageProvider}
          onProviderSelect={handleImageProviderSelect}
        />

        {/* Caption Style */}
        <CaptionStyleSelector
          selectedStyle={selectedCaptionStyle || "karaoke"}
          onStyleSelect={handleCaptionStyleSelect}
        />

        {/* Background Music */}
        <MusicSelector
          selectedMusic={selectedMusic || ""}
          onMusicSelect={handleMusicSelect}
        />

        {/* Generate Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
            disabled={isSubmitting || status === "generating"}
          >
            {isSubmitting || status === "generating" ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
