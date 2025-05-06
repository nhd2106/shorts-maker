import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";

// Define available image providers
// const imageProviders = ["default", "openai"];
const imageProviders = ["default"];

interface ImageProviderProps {
  onProviderSelect: (provider: string) => void;
  selectedProvider: string;
}

export function ImageProvider({
  onProviderSelect,
  selectedProvider,
}: ImageProviderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Image Provider</Label>
          <Select value={selectedProvider} onValueChange={onProviderSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select image provider" />
            </SelectTrigger>
            <SelectContent>
              {imageProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Placeholder for potential future options like API keys or specific settings per provider */}
      </Card>
    </motion.div>
  );
}
