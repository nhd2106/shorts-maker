import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormData } from "@/types/video-generator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  idea: z.string().min(10, "Idea must be at least 10 characters long"),
  videoFormat: z.enum(["shorts", "normal"], {
    required_error: "Please select a video format",
  }),
  voiceModel: z.enum(["edge", "openai", "google", "vixtts"], {
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
    "en-US-SteffanNeural",
    "alloy",
    "nova",
    "shimmer",
    "echo",
    "fable",
    "vivos",
  ]),
});

type GenerationFormProps = {
  onSubmit: (data: FormData) => Promise<void>;
  status: string;
  setSelectedFormat: (format: "shorts" | "normal") => void;
};

export function GenerationForm({
  onSubmit,
  status,
  setSelectedFormat,
}: GenerationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoFormat: "shorts",
      voiceModel: "edge",
      voice: "vi-VN-NamMinhNeural",
    },
  });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="relative space-y-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-2">
        <Textarea
          {...register("idea")}
          placeholder="Enter your creative video idea..."
          disabled={status === "generating" || status === "downloading"}
          className="w-full text-lg px-6 transition-all border-2 rounded-xl focus:border-purple-500 hover:border-gray-400 bg-white/70 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-gray-600 dark:text-white dark:placeholder-gray-400 backdrop-blur-sm shadow-sm"
          rows={5}
        />
        {errors.idea && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-destructive dark:text-red-400 font-medium pl-1"
          >
            {errors.idea.message}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            Video Format
          </label>
          <Select
            onValueChange={(value: string) => {
              setValue("videoFormat", value as "shorts" | "normal");
              setSelectedFormat(value as "shorts" | "normal");
            }}
            defaultValue="shorts"
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shorts">Shorts (9:16)</SelectItem>
              <SelectItem value="normal">Normal (16:9)</SelectItem>
            </SelectContent>
          </Select>
          {errors.videoFormat && (
            <p className="text-sm text-destructive">
              {errors.videoFormat.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            Voice Model
          </label>
          <Select
            onValueChange={(value: string) =>
              setValue("voiceModel", value as "edge" | "openai" | "google")
            }
            defaultValue="edge"
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select voice model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="edge">Edge (Female, Energetic)</SelectItem>
              <SelectItem value="openai">OpenAI (Female, Soft)</SelectItem>
              <SelectItem value="google">Google (Male, Deep)</SelectItem>
              <SelectItem value="vixtts">TTSViet (Male, Neutral)</SelectItem>
            </SelectContent>
          </Select>
          {errors.voiceModel && (
            <p className="text-sm text-destructive">
              {errors.voiceModel.message}
            </p>
          )}

          <Select
            onValueChange={(value: string) =>
              setValue("voice", value as "vi-VN-NamMinhNeural")
            }
            defaultValue="vi-VN-NamMinhNeural"
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi-VN-NamMinhNeural">
                Nam Minh (Male, Neutral)
              </SelectItem>
              <SelectItem value="vi-VN-ThanhMinhNeural">
                Thanh Minh (Male, Neutral)
              </SelectItem>
              <SelectItem value="vi-VN-ThuyTrangNeural">
                Thuy Trang (Female, Neutral)
              </SelectItem>
              <SelectItem value="alloy">Alloy (Male, Neutral)</SelectItem>
              <SelectItem value="nova">Nova (Female, Neutral)</SelectItem>
              <SelectItem value="shimmer">Shimmer (Female, Neutral)</SelectItem>
              <SelectItem value="echo">Echo (Male, Neutral)</SelectItem>
              <SelectItem value="fable">Fable (Male, Neutral)</SelectItem>
              <SelectItem value="vivos">Vivos (Female, Neutral)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={status === "generating" || status === "downloading"}
        className="w-full h-14 text-lg font-medium transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 hover:scale-[1.01] rounded-xl shadow-lg hover:shadow-purple-500/25"
      >
        {status === "generating" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Magic...
          </>
        ) : (
          "Generate Your Short ✨"
        )}
      </Button>
    </motion.form>
  );
}
