use tauri::{App, Manager};

/// Initialize window: hide initially
pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide()?;
    }
    Ok(())
}
