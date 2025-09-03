import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Subtitles,
  Type,
  Palette,
  Sparkles,
  Music,
  Keyboard,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCaptionStyles } from "@/queries/caption-styles";
import { Skeleton } from "@/components/ui/skeleton";

interface CaptionStyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
}

// Icon mapping for different caption styles
const iconMap: Record<string, typeof Music> = {
  karaoke: Music,
  boldImpact: Subtitles,
  neonGlow: Sparkles,
  typewriter: Keyboard,
  splitColor: Palette,
  minimalist: Type,
  wordPop: Zap,
};

// Default styles as fallback when API is not available
const defaultStyles = [
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Word-by-word yellow highlighting effect as text is spoken",
  },
  {
    id: "boldImpact",
    name: "Bold Impact",
    description: "Thick white text with heavy black outline, popular on TikTok",
  },
  {
    id: "neonGlow",
    name: "Neon Glow",
    description:
      "Magenta text with pink glow effect, perfect for party/music content",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    description: "Letter-by-letter appearance with retro terminal feel",
  },
  {
    id: "splitColor",
    name: "Split Color",
    description: "Two-tone gradient text with modern, dynamic appearance",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, thin text with minimal styling",
  },
  {
    id: "wordPop",
    name: "Word Pop",
    description: "One word at a time with scale-up animation effect",
  },
];

export function CaptionStyleSelector({
  selectedStyle,
  onStyleSelect,
}: CaptionStyleSelectorProps) {
  const { data: apiStyles, isLoading } = useCaptionStyles();

  // Use API styles if available, otherwise fall back to default styles
  const styles = apiStyles || defaultStyles;

  return (
    <div className="space-y-4">
      <Label>Caption Style</Label>
      {isLoading ? (
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <RadioGroup value={selectedStyle} onValueChange={onStyleSelect}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
              {Object.values(styles).map((style) => {
                const Icon = iconMap[style.id] || Type;
                return (
                  <motion.div
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label
                      htmlFor={style.id}
                      className={`
                        flex items-start space-x-2 p-2.5 rounded-lg border cursor-pointer transition-all
                        ${
                          selectedStyle === style.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <RadioGroupItem value={style.id} id={style.id} />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {style.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {style.description}
                        </p>
                      </div>
                    </label>
                  </motion.div>
                );
              })}
            </div>
          </RadioGroup>
        </Card>
      )}
    </div>
  );
}
