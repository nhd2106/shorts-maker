// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
// use tauri emitter
use tauri::Emitter;
use tauri::path::BaseDirectory;
use std::time::Duration;
use std::thread;

// Store the sidecar process globally with a status flag
struct SidecarState {
    process: Arc<Mutex<Option<CommandChild>>>,
    is_starting: Arc<Mutex<bool>>,
}

impl Default for SidecarState {
    fn default() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            is_starting: Arc::new(Mutex::new(false)),
        }
    }
}

#[tauri::command]
async fn start_sidecar(app: tauri::AppHandle, state: State<'_, SidecarState>) -> Result<(), String> {
    // Check if already starting
    {
        let mut is_starting = state.is_starting.lock().unwrap();
        if *is_starting {
            return Err("Sidecar start already in progress".to_string());
        }
        *is_starting = true;
    }

    // First, ensure any existing process is cleaned up
    kill_existing_sidecar(&state).await;

    let resource_path = app
        .path()
        .resolve("resources/info.log", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    let sidecar_command = app
        .shell()
        .sidecar("my-sidecar")
        .map_err(|e| e.to_string())?
        .args([resource_path]);

    let (mut rx, child) = match sidecar_command.spawn() {
        Ok((rx, child)) => (rx, child),
        Err(e) => {
            let mut is_starting = state.is_starting.lock().unwrap();
            *is_starting = false;
            return Err(format!("Failed to spawn sidecar: {}", e));
        }
    };

    // Store the child process
    {
        let mut process = state.process.lock().unwrap();
        *process = Some(child);
    }

    // Clone AppHandle and state for the async task
    let app_handle = app.clone();
    let state_clone = Arc::clone(&state.process);
    let is_starting_clone = Arc::clone(&state.is_starting);

    // Spawn a task to read stdout
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line = String::from_utf8_lossy(&line);
                    if line.contains("-") && line.contains(":") {
                        app_handle.emit("sidecar-timestamp", line.to_string()).ok();
                    } else {
                        app_handle.emit("sidecar-message", line.to_string()).ok();
                    }
                }
                CommandEvent::Stderr(line) => {
                    let line = String::from_utf8_lossy(&line);
                    app_handle.emit("sidecar-error", line.to_string()).ok();
                }
                CommandEvent::Error(err) => {
                    app_handle.emit("sidecar-error", format!("Error: {}", err)).ok();
                    cleanup_process(&state_clone, &is_starting_clone);
                }
                CommandEvent::Terminated(status) => {
                    app_handle
                        .emit("sidecar-error", format!("Process terminated with status: {:?}", status))
                        .ok();
                    cleanup_process(&state_clone, &is_starting_clone);
                }
                _ => {}
            }
        }
    });

    // Reset starting flag after successful start
    {
        let mut is_starting = state.is_starting.lock().unwrap();
        *is_starting = false;
    }

    Ok(())
}

async fn kill_existing_sidecar(state: &SidecarState) {
    if let Ok(mut process) = state.process.lock() {
        if let Some(mut child) = process.take() {
            let _ = child.write("Exit\n".as_bytes());
            thread::sleep(Duration::from_millis(500)); // Give it time to exit gracefully
            let _ = child.kill();
        }
    }

    // Force kill any remaining instances
    #[cfg(target_os = "windows")]
    let _ = std::process::Command::new("taskkill")
        .args(["/F", "/IM", "my-sidecar.exe"])
        .output();

    #[cfg(not(target_os = "windows"))]
    let _ = std::process::Command::new("pkill")
        .arg("-f")
        .arg("my-sidecar")
        .output();
}

fn cleanup_process(process: &Arc<Mutex<Option<CommandChild>>>, is_starting: &Arc<Mutex<bool>>) {
    if let Ok(mut process_guard) = process.lock() {
        if let Some(mut child) = process_guard.take() {
            let _ = child.write("Exit\n".as_bytes());
            let _ = child.kill();
        }
    }
    if let Ok(mut is_starting) = is_starting.lock() {
        *is_starting = false;
    }
}

#[tauri::command]
async fn shutdown_sidecar(state: State<'_, SidecarState>) -> Result<String, String> {
    kill_existing_sidecar(&state).await;
    Ok("Sidecar process terminated".to_string())
}

fn main() {
    tauri::Builder::default()
        .manage(SidecarState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![start_sidecar, shutdown_sidecar])
        .setup(|app| {
            let app_handle = app.app_handle();
            let window = app_handle.get_webview_window("main").unwrap();
            
            // Get state before the closure
            let state = app.state::<SidecarState>();
            let process = Arc::clone(&state.process);
            let is_starting = Arc::clone(&state.is_starting);
            
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Destroyed = event {
                    // Use the cloned state instead of the original reference
                    let mut process_guard = process.lock().unwrap();
                    if let Some(mut child) = process_guard.take() {
                        let _ = child.write("Exit\n".as_bytes());
                        thread::sleep(Duration::from_millis(500));
                        let _ = child.kill();
                    }
                    
                    // Reset the starting flag
                    if let Ok(mut is_starting) = is_starting.lock() {
                        *is_starting = false;
                    }

                    // Force kill any remaining instances
                    #[cfg(target_os = "windows")]
                    let _ = std::process::Command::new("taskkill")
                        .args(["/F", "/IM", "my-sidecar.exe"])
                        .output();

                    #[cfg(not(target_os = "windows"))]
                    let _ = std::process::Command::new("pkill")
                        .arg("-f")
                        .arg("my-sidecar")
                        .output();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
