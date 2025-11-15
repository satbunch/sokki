use tauri::{App, Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

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
