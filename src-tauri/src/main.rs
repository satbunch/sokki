// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod menu;
mod shortcut_manager;
mod tray;
mod window;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            window::set_window_opacity,
            window::hide_app_and_focus_previous,
            shortcut_manager::update_global_shortcut,
            shortcut_manager::set_global_shortcut_enabled
        ])
        .setup(|app| {
            // Initialize tray
            tray::init(app)?;

            // Initialize window
            window::init(app)?;

            // Initialize global shortcuts and manage state
            let current_shortcut = shortcut_manager::init(app)?;
            app.manage(current_shortcut);

            // Initialize menu
            menu::init(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
