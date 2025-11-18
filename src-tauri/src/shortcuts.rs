use tauri::{App, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Register global shortcuts for the application
/// Only Cmd+Shift+M is registered as a global shortcut
pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();

    // Show window shortcut (Cmd+Shift+M)
    // Only shows window and sets focus (does not toggle)
    {
        let app_handle = app_handle.clone();
        match app_handle.global_shortcut().on_shortcut(
            Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM),
            move |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            },
        ) {
            Ok(_) => {},
            Err(e) => {
                eprintln!("Failed to register global shortcut: {}", e);
                // Don't fail the app startup if shortcut registration fails
            }
        }
    }

    Ok(())
}
