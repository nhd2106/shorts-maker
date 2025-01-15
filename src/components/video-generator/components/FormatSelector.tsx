import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Smartphone, Monitor } from "lucide-react";

interface FormatSelectorProps {
  selectedFormat: "shorts" | "normal";
  onFormatSelect: (format: "shorts" | "normal") => void;
}

export function FormatSelector({
  selectedFormat,
  onFormatSelect,
}: FormatSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Video Format</Label>
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className={cn(
              "p-4 cursor-pointer transition-colors",
              selectedFormat === "shorts"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => onFormatSelect("shorts")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background/10 rounded-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Shorts</h3>
                <p className="text-sm opacity-90">
                  Vertical video optimized for mobile
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className={cn(
              "p-4 cursor-pointer transition-colors",
              selectedFormat === "normal"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => onFormatSelect("normal")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background/10 rounded-lg">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Normal</h3>
                <p className="text-sm opacity-90">
                  Landscape video for regular content
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
