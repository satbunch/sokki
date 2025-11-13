use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    App, Emitter,
};

pub fn init(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let app_menu = Submenu::with_items(
        app,
        "Sokki",
        true,
        &[
            &MenuItem::with_id(app, "about", "About Sokki", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "settings", "Settings...", true, Some("Cmd+,"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, Some("Hide Sokki"))?,
            &PredefinedMenuItem::hide_others(app, Some("Hide Others"))?,
            &PredefinedMenuItem::show_all(app, Some("Show All"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "quit", "Quit Sokki", true, Some("CmdOrCtl+Q"))?,
        ],
    )?;

    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "new_tab", "New Tab", true, Some("Cmd+N"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "close_tab", "Close Tab", true, Some("Cmd+W"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "open_window", "Show Window", true, Some("Cmd+Shift+M"))?,
        ],
    )?;

    let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, Some("Undo"))?,
            &PredefinedMenuItem::redo(app, Some("Redo"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, Some("Cut"))?,
            &PredefinedMenuItem::copy(app, Some("Copy"))?,
            &PredefinedMenuItem::paste(app, Some("Paste"))?,
            &PredefinedMenuItem::select_all(app, Some("Select All"))?,
            &PredefinedMenuItem::separator(app)?,
        ],
    )?;

    let menu = Menu::with_items(app, &[&app_menu, &file_menu, &edit_menu])?;
    app.set_menu(menu)?;

    // Set up menu event handler
    app.on_menu_event(|app_handle, event| {
        match event.id.as_ref() {
            "settings" => {
                // Emit settings-menu event to React
                let _ = app_handle.emit("settings-menu", ());
            }
            "copy" => {
                // Emit copy-content event to React when Copy menu item is clicked
                let _ = app_handle.emit("copy-content", ());
            }
            "new_tab" => {
                // Emit new-tab event to React when New Tab menu item is clicked
                let _ = app_handle.emit("new-tab", ());
            }
            "close_tab" => {
                // Emit delete-tab event to React when Close Tab menu item is clicked
                let _ = app_handle.emit("delete-tab", ());
            }
            _ => {}
        }
    });

    Ok(())
}
