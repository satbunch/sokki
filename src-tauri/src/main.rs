// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::json;
use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // System tray configuration
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;
            let icon = Image::from_path("icons/icon.png")?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(icon)
                .menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    match event {
                        // Left click: show and focus window
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        // Right click: menu will be displayed automatically by Tauri
                        TrayIconEvent::Click {
                            button: MouseButton::Right,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // Menu display is handled automatically
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Get window and hide initially
            let window = app.get_webview_window("main").unwrap();
            window.hide().unwrap();

            // ====== Global shortcut registration =====
            // Show/Focus shortcut (Cmd+Shift+M)
            let app_handle = app.handle();

            {
                app_handle.global_shortcut().on_shortcut(
                    Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM),
                    move |app, _shortcut, event| {
                        if event.state == ShortcutState::Pressed {
                            if let Some(window) = app.get_webview_window("main") {
                                let visible = window.is_visible().unwrap_or(false);
                                if !visible {
                                    let _ = window.show();
                                }
                                let _ = window.set_focus();
                            }
                        }
                    },
                )?;
            }

            // New memo shortcut (Cmd+Shift+N)
            // Shows window and emits new-memo event
            {
                app_handle.global_shortcut().on_shortcut(
                    Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN),
                    move |app, _shortcut, event| {
                        if event.state == ShortcutState::Pressed {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    // Send mode for React side branching
                                    let _ = window.emit("new-memo", json!({ "mode": "new" }));
                                }
                            }
                        }
                    },
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
