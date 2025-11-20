use tauri::{App, TitleBarStyle, WebviewUrl, WebviewWindowBuilder, AppHandle};

/// Set window opacity level (0.0 - 1.0, representing 0% - 100%)
/// Minimum opacity is 0.2 (20%) to ensure visibility even at lowest setting
#[tauri::command]
pub fn set_window_opacity(
    window: tauri::WebviewWindow,
    opacity: f64,
) -> Result<(), String> {
    // Clamp opacity: minimum 0.2 (20%) to keep window visible, maximum 1.0 (100%)
    let clamped_opacity = opacity.clamp(0.2, 1.0);

    // Apply transparency on macOS using Cocoa API
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::NSWindow;
        use std::os::raw::c_void;

        let raw = window.ns_window().map_err(|e| format!("failed to get ns_window handle: {e}"))?;
        // let ns_window = window.ns_window().unwrap() as id;
        let ns_window = raw as *mut c_void as *mut NSWindow;
        if ns_window.is_null() {
            return Err("ns_window pointer was null".into());
        }
        unsafe {
            (*ns_window).setAlphaValue(clamped_opacity);
        }
    }

    // Fallback for other platforms: apply opacity to body
    #[cfg(not(target_os = "macos"))]
    {
        if let Err(e) = window.eval(&format!(
            "document.body.style.opacity = '{}'",
            clamped_opacity
        )) {
            eprintln!("Failed to set opacity via JS: {e}");
        };
    }

    Ok(())
}

#[tauri::command]
pub fn hide_app_and_focus_previous() {
    #[cfg(target_os = "macos")]
    {
        use objc2::runtime::AnyObject;
        use objc2_foundation::MainThreadMarker;
        use objc2_app_kit::{NSApp, NSApplication};

        if let Some(mtm) = MainThreadMarker::new() {
            let app: objc2::rc::Retained<NSApplication> = NSApp(mtm);
            app.hide(None::<&AnyObject>);
        }
    }
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

/// Initialize window: hide initially
pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let mut win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Sokki")
        .inner_size(800.0, 500.0)
        .min_inner_size(400.0, 300.0)
        .center()
        .visible(true)
        .resizable(true)
        .maximizable(false);

    // set transparent title bar only when building for macOS
    #[cfg(target_os = "macos")]
    {
        win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);
    }

    let window = win_builder.build()?;

    // Apply vibrancy (blur effect) and set background color on macOS
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::{NSColor, NSWindow};
        use std::os::raw::c_void;

        if let Ok(raw) = window.ns_window() {
            let ns_window = raw as *mut c_void as *mut NSWindow;
            if ns_window.is_null() {
                eprintln!("ns_window pointer was null when setting background color")
            } else {
                unsafe {
                    let r = 103.0 / 255.0;
                    let g = 146.0 / 255.0;
                    let b = 177.0 / 255.0;
                    let a = 1.0;

                    let bg_color = NSColor::colorWithCalibratedRed_green_blue_alpha(r, g, b, a);

                    (*ns_window).setBackgroundColor(Some(&*bg_color));
                }
            }
        } else {
            eprintln!("Failed to get ns_window handle when setting background color");
        }
    }

    Ok(())
}
