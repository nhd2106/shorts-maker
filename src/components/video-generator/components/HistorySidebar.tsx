import { HistoryItem } from "@/types/video-generator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { motion } from "motion/react";

type HistorySidebarProps = {
  history: HistoryItem[];
  onHistoryItemClick: (item: HistoryItem) => void;
  onDeleteHistoryItem: (itemId: string, e: React.MouseEvent) => void;
  onRetryGeneration: (item: HistoryItem, e: React.MouseEvent) => void;
};

export function HistorySidebar({
  history,
  onHistoryItemClick,
  onDeleteHistoryItem,
  onRetryGeneration,
}: HistorySidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hidden lg:block flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-lg dark:text-white">
          Generation History
        </h3>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-4">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 space-y-2 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group"
              onClick={() => onHistoryItemClick(item)}
            >
              {/* Delete button */}
              <button
                onClick={(e) => onDeleteHistoryItem(item.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              </button>

              {/* Timestamp and Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  {formatDistanceToNow(new Date(item.timestamp), {
                    addSuffix: true,
                  })}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : item.status === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {item.status === "generating_content"
                    ? "Generating Content"
                    : item.status === "generating_audio"
                    ? "Generating Audio"
                    : item.status === "generating_images"
                    ? "Generating Images"
                    : item.status === "generating_video"
                    ? "Generating Video"
                    : item.status === "completed"
                    ? "Completed"
                    : item.status === "failed"
                    ? "Failed"
                    : item.status === "pending"
                    ? "Pending"
                    : "Idle"}
                </span>
              </div>

              {/* Idea Text */}
              <p className="text-sm line-clamp-2 dark:text-gray-300">
                {item.idea}
              </p>

              {/* Format Badge and Retry Button */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {item.format}
                </span>
                {item.status === "failed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetryGeneration(item, e);
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {history.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground dark:text-gray-400 py-8"
            >
              <p>No generation history yet</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
