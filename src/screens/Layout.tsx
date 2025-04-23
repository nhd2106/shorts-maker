import { HistorySidebar } from "@/components/video-generator/HistorySidebar";
import { VideoGeneratorHeader } from "@/components/video-generator/components/VideoGeneratorHeader";
import { useTheme } from "@/components/video-generator/hooks/useTheme";
import { Outlet } from "react-router";
// import { authClient } from "@/lib/auth-client";

export default function WorkspaceLayout() {
  const { theme, setTheme } = useTheme();
  // const { data: session } = authClient.useSession();

  // if (!session) {
  //   return <Navigate to="/auth" />;
  // }

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
