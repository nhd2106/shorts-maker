import { HistoryItem } from "@/types/video-generator";

export function saveHistoryToLocalStorage(history: HistoryItem[]) {
  try {
    localStorage.setItem("videoGenHistory", JSON.stringify(history));
  } catch (e) {
    console.log("Failed to save history to localStorage:", e);
  }
}

export function loadHistoryFromLocalStorage(): HistoryItem[] {
  try {
    const saved = localStorage.getItem("videoGenHistory");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: HistoryItem) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    }
  } catch (e) {
    console.log("Failed to load history from localStorage:", e);
  }
  return [];
}
