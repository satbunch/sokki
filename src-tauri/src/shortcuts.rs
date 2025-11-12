use serde_json::json;
use tauri::{App, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Register global shortcuts for the application
pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();

    // Show/Focus shortcut (Cmd+Shift+M)
    // Toggles window visibility: shows if hidden, hides if visible
    {
        let app_handle = app_handle.clone();
        app_handle.global_shortcut().on_shortcut(
            Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM),
            move |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let visible = window.is_visible().unwrap_or(false);
                        if visible {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            },
        )?;
    }

    // New memo shortcut (Cmd+Shift+N)
    // Shows window if hidden, keeps it visible if already shown
    // Emits new-memo event for React side to clear content and focus textarea
    {
        let app_handle = app_handle.clone();
        app_handle.global_shortcut().on_shortcut(
            Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN),
            move |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let visible = window.is_visible().unwrap_or(false);
                        if !visible {
                            let _ = window.show();
                        }
                        let _ = window.set_focus();
                        // Send mode for React side branching
                        let _ = window.emit("new-memo", json!({ "mode": "new" }));
                    }
                }
            },
        )?;
    }

    // Close/Delete tab shortcut (Cmd+W)
    // Emits delete-tab event for React side to delete the active note
    {
        let app_handle = app_handle.clone();
        app_handle.global_shortcut().on_shortcut(
            Shortcut::new(Some(Modifiers::SUPER), Code::KeyW),
            move |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        // Emit event to React side to delete active tab
                        let _ = window.emit("delete-tab", json!({}));
                    }
                }
            },
        )?;
    }

    Ok(())
}
