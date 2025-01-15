import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "../video-generator/hooks/useTheme";

type ThemeOption = {
  value: Theme;
  label: string;
  icon: typeof Sun;
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {themeOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            variant={theme === option.value ? "default" : "ghost"}
            size="icon"
            onClick={() => setTheme(option.value)}
            className={`w-9 h-9 ${
              theme === option.value
                ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
                : ""
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
