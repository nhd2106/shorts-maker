/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormData } from "@/types/video-generator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wand2, Sparkles } from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { VoiceSelector } from "./VoiceSelector";

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
    "alloy",
    "nova",
    "shimmer",
    "echo",
    "fable",
    "vivos",
    "WVkYyTxxVgMOsw1IIVL0",
    "7hsfEc7irDn6E8br0qfw",
    "t1LUnfTt7pXaYjubT04d", // DUOC
  ]),
});

interface VideoGeneratorFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onPrepare: (data: FormData) => Promise<void>;
  status: string;
  setSelectedFormat: (format: "shorts" | "normal") => void;
}

export function VideoGeneratorForm({
  onSubmit,
  onPrepare,
  status,
  setSelectedFormat,
}: VideoGeneratorFormProps) {
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
    },
  });

  const selectedFormat = watch("videoFormat");
  const selectedModel = watch("voiceModel");
  const selectedVoice = watch("voice");

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

  const generateIdeas = [
    "Create a video about the top 5 most fascinating scientific discoveries",
    "Make a tutorial on how to improve productivity with simple habits",
    "Share interesting facts about space exploration and future missions",
    "Explain complex tech concepts in simple terms",
    "Create a video about mindfulness and mental health tips",
  ];

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-4">
        <Label htmlFor="idea">Video Idea</Label>
        <Card className="p-4 space-y-4">
          <Textarea
            id="idea"
            placeholder="Enter your video idea here..."
            className="min-h-[120px] resize-none"
            {...register("idea")}
          />
          {errors.idea && (
            <p className="text-sm text-red-500">{errors.idea.message}</p>
          )}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Need inspiration? Try these ideas:
            </Label>
            <div className="flex flex-wrap gap-2">
              {generateIdeas.map((idea, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setValue("idea", idea)}
                >
                  <Sparkles className="w-4 h-4" />
                  Use This
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <FormatSelector
        selectedFormat={selectedFormat}
        onFormatSelect={handleFormatSelect}
      />

      <VoiceSelector
        selectedModel={selectedModel}
        selectedVoice={selectedVoice}
        onModelSelect={handleModelSelect}
        onVoiceSelect={handleVoiceSelect}
      />

      <div className="flex gap-4">
        <Button
          type="button"
          className="flex-1 gap-2"
          size="lg"
          variant="outline"
          disabled={isSubmitting || status === "generating"}
          onClick={handleSubmit(onPrepare)}
        >
          {isSubmitting || status === "generating" ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
              Preparing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Prepare Data
            </>
          )}
        </Button>

        <Button
          type="submit"
          className="flex-1 gap-2"
          size="lg"
          disabled={isSubmitting || status === "generating"}
        >
          {isSubmitting || status === "generating" ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Video
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
