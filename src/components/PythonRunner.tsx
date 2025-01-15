import { invoke } from "@tauri-apps/api/core";

export function PythonRunner() {
  const runPython = async () => {
    try {
      const result = await invoke("run_python_script");
      console.log("Python result:", result);
    } catch (error) {
      console.error("Error running Python:", error);
    }
  };

  return (
    <button
      onClick={runPython}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Run Python Script
    </button>
  );
}
