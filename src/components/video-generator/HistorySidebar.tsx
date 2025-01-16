import { HistoryItem } from "@/types/video-generator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Settings, PanelLeft, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  loadHistoryFromLocalStorage,
  saveHistoryToLocalStorage,
} from "@/utils/local-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ApiKeys = {
  openai: string;
  together: string;
  elevenlabs: string;
};

export function HistorySidebar() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const savedKeys = localStorage.getItem("api-keys");
    return savedKeys
      ? JSON.parse(savedKeys)
      : {
          openai: "",
          together: "",
          elevenlabs: "",
        };
  });
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial history and set up storage event listener
  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = loadHistoryFromLocalStorage();
      setHistory(savedHistory);
    };

    // Load initial history
    loadHistory();

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "video-generation-history") {
        loadHistory();
      }
    };

    // Add event listener
    window.addEventListener("storage", handleStorageChange);

    // Poll for changes every 2 seconds as a fallback
    const interval = setInterval(loadHistory, 2000);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const onHistoryItemClick = (item: HistoryItem) => {
    navigate(`/${item.id}`);
  };

  const onDeleteHistoryItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((item) => item.id !== itemId);
    setHistory(newHistory);
    saveHistoryToLocalStorage(newHistory);
  };

  const onRetryGeneration = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === "failed") {
      navigate(`/${item.id}?retry=true`);
    }
  };

  const handleSaveApiKeys = () => {
    localStorage.setItem("api-keys", JSON.stringify(apiKeys));
  };

  const missingRequiredKeys = !apiKeys.openai || !apiKeys.together;

  return (
    <div
      className={`border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hidden lg:flex flex-col h-screen transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-96"
      }`}
    >
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PanelLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? "text-blue-600" : ""
            }`}
          />
        </Button>
        {!isCollapsed && (
          <h3 className="font-semibold text-lg dark:text-white">
            Generation History
          </h3>
        )}
      </div>

      {!isCollapsed && missingRequiredKeys && (
        <div className="mx-4 mt-4 p-4 text-sm border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <p>OpenAI and Together AI keys are required for video generation.</p>
        </div>
      )}

      {!isCollapsed && (
        <>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all bg-white dark:bg-gray-800 group relative"
                    onClick={() => onHistoryItemClick(item)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm line-clamp-2 dark:text-white">
                          {item.idea}
                        </p>
                        <button
                          onClick={(e) => onDeleteHistoryItem(item.id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                        <span>•</span>
                        <label
                          className="
                          capitalize
                          bg-gray-200 dark:bg-gray-700
                          text-green-900 dark:text-gray-200
                          rounded-full px-1.5 py-1
                        "
                        >
                          {item.status.replace(/_/g, " ")}
                        </label>
                      </div>
                      {item.status === "failed" && (
                        <button
                          onClick={(e) => onRetryGeneration(item, e)}
                          className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure API Keys
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>API Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai">OpenAI API Key</Label>
                    <Input
                      id="openai"
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, openai: e.target.value })
                      }
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="together">Together AI API Key</Label>
                    <Input
                      id="together"
                      type="password"
                      value={apiKeys.together}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, together: e.target.value })
                      }
                      placeholder="tok-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
                    <Input
                      id="elevenlabs"
                      type="password"
                      value={apiKeys.elevenlabs}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, elevenlabs: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveApiKeys} className="w-full">
                    Save API Keys
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
}
