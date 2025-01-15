import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";
// import { motion } from "motion/react";
import { Theme } from "../hooks/useTheme";

interface VideoGeneratorHeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function VideoGeneratorHeader({
  theme,
  onThemeChange,
}: VideoGeneratorHeaderProps) {
  return (
    <>
      <div className="flex justify-end mb-4 space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onThemeChange("light")}
          className={`${
            theme === "light"
              ? "bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700"
              : "dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          <Sun className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onThemeChange("dark")}
          className={`${
            theme === "dark"
              ? "bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700"
              : "dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          <Moon className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onThemeChange("system")}
          className={`${
            theme === "system"
              ? "bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700"
              : "dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          <Monitor className="h-5 w-5" />
        </Button>
      </div>
      {/* 
      <Card className="w-full p-8 space-y-8 shadow-2xl rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-purple-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-200 rounded-full blur-3xl opacity-20" />

        <div className="relative space-y-3 text-center">
          <motion.h2
            className="text-4xl font-bold tracking-tight dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-300 dark:to-purple-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              YouTube Shorts Generator
            </span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transform your ideas into engaging YouTube Shorts in minutes ✨
          </motion.p>
        </div>
      </Card> */}
    </>
  );
}
