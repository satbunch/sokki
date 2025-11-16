use tauri::{App, Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

/// Set window opacity level (0.0 - 1.0, representing 0% - 100%)
/// Minimum opacity is 0.2 (20%) to ensure visibility even at lowest setting
#[tauri::command]
pub fn set_window_opacity(
    window: tauri::WebviewWindow,
    opacity: f64,
) -> Result<(), String> {
    // Clamp opacity: minimum 0.2 (20%) to keep window visible, maximum 1.0 (100%)
    let clamped_opacity = opacity.max(0.2).min(1.0);

    // Apply opacity to body instead of documentElement to preserve blur on container
    let _ = window.eval(&format!(
        "document.body.style.opacity = '{}'",
        clamped_opacity
    ));

    Ok(())
}

/// Initialize window: hide initially
pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Sokki")
        .inner_size(600.0, 400.0)
        .min_inner_size(400.0, 300.0)
        .center()
        .visible(false)
        .resizable(true)
        .maximizable(false)
        .title_bar_style(TitleBarStyle::Transparent);

    // set transparent title bar only when building for macOS
    #[cfg(target_os = "macos")]
    let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

    let window = win_builder.build().unwrap();

    //set background color only when building for macOS
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSColor, NSWindow};
        use cocoa::base::{id, nil};

        let ns_window = window.ns_window().unwrap() as id;
        unsafe {
            let bg_color = NSColor::colorWithCalibratedRed_green_blue_alpha_(
                nil,
                103.0 / 255.0,  // R
                146.0 / 255.0,  // G
                177.0 / 255.0,  // B
                1.0,            // A
            );
            ns_window.setBackgroundColor_(bg_color);
        }
    }

    Ok(())
}
