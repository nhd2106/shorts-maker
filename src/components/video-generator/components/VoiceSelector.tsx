/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getAvailableModels } from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Volume2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

const sampleVoices = {
  openai: {
    alloy: "https://cdn.openai.com/API/docs/audio/alloy.wav",
    echo: "https://cdn.openai.com/API/docs/audio/echo.wav",
    shimmer: "https://cdn.openai.com/API/docs/audio/shimmer.wav",
    nova: "https://cdn.openai.com/API/docs/audio/nova.wav",
    fable: "https://cdn.openai.com/API/docs/audio/fable.wav",
    onyx: "https://cdn.openai.com/API/docs/audio/onyx.wav",
  },
};

interface VoiceSelectorProps {
  onModelSelect: (model: string) => void;
  onVoiceSelect: (voice: string) => void;
  selectedModel: string;
  selectedVoice: string;
  elevenlabsVoices: any;
}

export function VoiceSelector({
  onModelSelect,
  onVoiceSelect,
  selectedModel,
  selectedVoice,
  elevenlabsVoices,
}: VoiceSelectorProps) {
  const [models, setModels] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    getAvailableModels().then(setModels).catch(console.log);
  }, []);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioElement) {
      const voices = sampleVoices?.[
        selectedModel as keyof typeof sampleVoices
      ] as any;
      const url = voices?.[selectedVoice];
      const audio = new Audio(url);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } else {
      if (isPlaying) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
      if (
        audioElement.src !==
        `https://cdn.openai.com/API/docs/audio/${selectedVoice}.wav`
      ) {
        audioElement.src = `https://cdn.openai.com/API/docs/audio/${selectedVoice}.wav`;
        audioElement.load();
        audioElement.play();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Voice Model</Label>
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models &&
                Object.keys(models).map((model) => (
                  <SelectItem key={model} value={model}>
                    {model.toUpperCase()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Voice</Label>
          <Select
            value={selectedVoice}
            onValueChange={onVoiceSelect}
            disabled={!selectedModel || !models}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {selectedModel === "elevenlabs"
                ? elevenlabsVoices.map((voice: any) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </SelectItem>
                  ))
                : models &&
                  selectedModel &&
                  (models?.[selectedModel]?.voices ?? []).map(
                    (voice: string) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    )
                  )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {selectedVoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Preview Voice</span>
                </div>
                <div
                  onClick={handlePreview}
                  className={clsx(
                    buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "cursor-pointer",
                    })
                  )}
                >
                  {isPlaying ? "Stop" : "Play"} Sample
                  <Play className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
