use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

/// Initialize system tray with menu and icon
pub fn init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // Create menu items
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

    // Load tray icon
    static TRAY_ICON: &[u8] = include_bytes!("../icons/icon.png");
    let icon = Image::from_bytes(TRAY_ICON)?;

    // Build and register tray icon
    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .icon(icon)
        .show_menu_on_left_click(false)
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

    Ok(())
}
