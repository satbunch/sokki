// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;
mod shortcuts;
mod tray;
mod window;

/// Set window opacity level (0.0 - 1.0, representing 0% - 100%)
#[tauri::command]
fn set_window_opacity(
    window: tauri::WebviewWindow,
    opacity: f64,
) -> Result<(), String> {
    let clamped_opacity = opacity.max(0.0).min(1.0);

    // Apply opacity to body instead of documentElement to preserve blur on container
    let _ = window.eval(&format!(
        "document.body.style.opacity = '{}'",
        clamped_opacity
    ));

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![set_window_opacity])
        .setup(|app| {
            // Initialize tray
            tray::init(app)?;

            // Initialize window
            window::init(app)?;

            // Initialize global shortcuts
            shortcuts::init(app)?;

            // Initialize menu
            menu::init(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
