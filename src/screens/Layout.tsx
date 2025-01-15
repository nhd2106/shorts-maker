import { HistorySidebar } from "@/components/video-generator/HistorySidebar";
import { VideoGeneratorHeader } from "@/components/video-generator/components/VideoGeneratorHeader";
import { useTheme } from "@/components/video-generator/hooks/useTheme";
import { Outlet } from "react-router";

export default function WorkspaceLayout() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background">
      <div className="flex">
        <HistorySidebar />
        <div className="flex-1">
          <div className="container max-w-6xl mx-auto p-4 space-y-8">
            <VideoGeneratorHeader theme={theme} onThemeChange={setTheme} />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
