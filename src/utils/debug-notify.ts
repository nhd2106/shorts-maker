import { sendNotification } from "@tauri-apps/plugin-notification";
import { isDevMode } from "./env";

type NotifyType = "success" | "error" | "info" | "debug";

const DEBUG_OVERLAY_ID = "debug-overlay";
const MAX_MESSAGES = 50;

let messages: { type: NotifyType; message: string; timestamp: string }[] = [];

function createOverlayIfNeeded() {
  if (!document.getElementById(DEBUG_OVERLAY_ID)) {
    const overlay = document.createElement("div");
    overlay.id = DEBUG_OVERLAY_ID;
    overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      max-height: 300px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      color: white;
      display: none;
    `;

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Toggle Debug";
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      padding: 8px 16px;
      background: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

    toggleButton.onclick = () => {
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
    };

    document.body.appendChild(overlay);
    document.body.appendChild(toggleButton);
  }
}

function updateOverlay() {
  const overlay = document.getElementById(DEBUG_OVERLAY_ID);
  if (overlay) {
    overlay.innerHTML = messages
      .map(
        ({ type, message, timestamp }) => `
        <div style="margin-bottom: 8px; padding: 8px; border-radius: 4px; background: ${
          type === "error"
            ? "rgba(255,0,0,0.2)"
            : type === "success"
            ? "rgba(0,255,0,0.2)"
            : type === "debug"
            ? "rgba(0,0,255,0.2)"
            : "rgba(255,255,255,0.2)"
        }">
          <span style="color: ${
            type === "error"
              ? "#ff6b6b"
              : type === "success"
              ? "#51cf66"
              : type === "debug"
              ? "#339af0"
              : "#ced4da"
          }">[${timestamp}] ${type.toUpperCase()}</span>
          <pre style="margin: 4px 0 0; white-space: pre-wrap;">${message}</pre>
        </div>
      `
      )
      .join("");
  }
}

export async function debugNotify(
  message: string,
  type: NotifyType = "debug",
  showNotification = true
) {
  if (!isDevMode) return;

  const timestamp = new Date().toLocaleTimeString();

  // Add to messages array
  messages.unshift({ type, message, timestamp });
  if (messages.length > MAX_MESSAGES) {
    messages = messages.slice(0, MAX_MESSAGES);
  }

  // Create and update overlay
  createOverlayIfNeeded();
  updateOverlay();

  // Show system notification if enabled
  if (showNotification) {
    sendNotification({
      title: `${type.toUpperCase()} - ${timestamp}`,
      body: message,
      icon:
        type === "error"
          ? "❌"
          : type === "success"
          ? "✅"
          : type === "debug"
          ? "🔍"
          : "ℹ️",
    });
  }
}
