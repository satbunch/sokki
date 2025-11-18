use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

/// Shortcut configuration structure from localStorage
#[derive(Debug, Serialize, Deserialize)]
struct ShortcutKey {
    #[serde(rename = "ctrlKey")]
    ctrl_key: bool,
    #[serde(rename = "shiftKey")]
    shift_key: bool,
    #[serde(rename = "altKey")]
    alt_key: bool,
    key: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ShortcutSettings {
    #[serde(rename = "globalShow")]
    global_show: ShortcutKey,
}

#[derive(Debug, Serialize, Deserialize)]
struct Settings {
    shortcuts: ShortcutSettings,
}

#[derive(Debug, Serialize, Deserialize)]
struct AppState {
    settings: Settings,
}

/// Global state to track current shortcut
pub struct CurrentShortcut {
    pub modifiers: Mutex<Option<Modifiers>>,
    pub code: Mutex<Code>,
    pub is_disabled: Mutex<bool>,
}

/// Convert string key to Code enum
fn string_to_code(key: &str) -> Option<Code> {
    match key.to_lowercase().as_str() {
        "a" => Some(Code::KeyA),
        "b" => Some(Code::KeyB),
        "c" => Some(Code::KeyC),
        "d" => Some(Code::KeyD),
        "e" => Some(Code::KeyE),
        "f" => Some(Code::KeyF),
        "g" => Some(Code::KeyG),
        "h" => Some(Code::KeyH),
        "i" => Some(Code::KeyI),
        "j" => Some(Code::KeyJ),
        "k" => Some(Code::KeyK),
        "l" => Some(Code::KeyL),
        "m" => Some(Code::KeyM),
        "n" => Some(Code::KeyN),
        "o" => Some(Code::KeyO),
        "p" => Some(Code::KeyP),
        "q" => Some(Code::KeyQ),
        "r" => Some(Code::KeyR),
        "s" => Some(Code::KeyS),
        "t" => Some(Code::KeyT),
        "u" => Some(Code::KeyU),
        "v" => Some(Code::KeyV),
        "w" => Some(Code::KeyW),
        "x" => Some(Code::KeyX),
        "y" => Some(Code::KeyY),
        "z" => Some(Code::KeyZ),
        "0" => Some(Code::Digit0),
        "1" => Some(Code::Digit1),
        "2" => Some(Code::Digit2),
        "3" => Some(Code::Digit3),
        "4" => Some(Code::Digit4),
        "5" => Some(Code::Digit5),
        "6" => Some(Code::Digit6),
        "7" => Some(Code::Digit7),
        "8" => Some(Code::Digit8),
        "9" => Some(Code::Digit9),
        _ => None,
    }
}

/// Load shortcut configuration from file
fn load_shortcut_config(app: &tauri::App) -> Result<ShortcutKey, Box<dyn std::error::Error>> {
    use std::fs;

    let app_data_dir = app.path().app_local_data_dir()?;
    let config_path = app_data_dir.join("shortcut.json");

    // If file doesn't exist, return default
    if !config_path.exists() {
        return Ok(ShortcutKey {
            ctrl_key: true,
            shift_key: true,
            alt_key: false,
            key: "m".to_string(),
        });
    }

    // Read and parse the config file
    let contents = fs::read_to_string(&config_path)?;
    let config: ShortcutKey = serde_json::from_str(&contents)?;

    Ok(config)
}

/// Disable/enable global shortcut (used when settings window is open/closed)
#[tauri::command]
pub fn set_global_shortcut_enabled(
    app: AppHandle,
    current_shortcut: State<CurrentShortcut>,
    enabled: bool,
) -> Result<String, String> {
    if let Ok(mut is_disabled) = current_shortcut.is_disabled.lock() {
        *is_disabled = !enabled;

        // Unregister if disabling
        if !enabled {
            if let (Ok(old_modifiers), Ok(old_code)) = (
                current_shortcut.modifiers.lock(),
                current_shortcut.code.lock(),
            ) {
                if let Some(old_mods) = *old_modifiers {
                    let old_shortcut = Shortcut::new(Some(old_mods), *old_code);
                    let _ = app.global_shortcut().unregister(old_shortcut);
                } else {
                    let old_shortcut = Shortcut::new(None, *old_code);
                    let _ = app.global_shortcut().unregister(old_shortcut);
                }
            }
            return Ok("Shortcut disabled".to_string());
        }

        // Re-register if enabling
        if let (Ok(mods), Ok(code)) = (
            current_shortcut.modifiers.lock(),
            current_shortcut.code.lock(),
        ) {
            let shortcut = Shortcut::new(*mods, *code);
            app.global_shortcut()
                .on_shortcut(shortcut, |app, _shortcut, _event| {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                })
                .map_err(|e| format!("Failed to re-register shortcut: {:?}", e))?;
            return Ok("Shortcut enabled".to_string());
        }
    }

    Err("Failed to acquire lock".to_string())
}

/// Update global shortcut dynamically
#[tauri::command]
pub fn update_global_shortcut(
    app: AppHandle,
    current_shortcut: State<CurrentShortcut>,
    ctrl_key: bool,
    shift_key: bool,
    alt_key: bool,
    key: String,
) -> Result<String, String> {
    use std::fs;
    use std::io::Write;

    // Parse modifiers
    let mut modifiers = Modifiers::empty();
    if ctrl_key {
        modifiers |= Modifiers::SUPER;
    }
    if shift_key {
        modifiers |= Modifiers::SHIFT;
    }
    if alt_key {
        modifiers |= Modifiers::ALT;
    }

    // Parse key
    let code = string_to_code(&key).ok_or_else(|| format!("Unsupported key: {}", key))?;

    // Unregister old shortcut if it exists
    if let (Ok(old_modifiers), Ok(old_code)) = (
        current_shortcut.modifiers.lock(),
        current_shortcut.code.lock(),
    ) {
        if let Some(old_mods) = *old_modifiers {
            let old_shortcut = Shortcut::new(Some(old_mods), *old_code);
            let _ = app.global_shortcut().unregister(old_shortcut);
        }
    }

    // Register new shortcut
    let new_shortcut = Shortcut::new(if modifiers.is_empty() { None } else { Some(modifiers) }, code);
    app.global_shortcut()
        .on_shortcut(new_shortcut, |app, _shortcut, _event| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        })
        .map_err(|e| format!("Failed to register shortcut: {:?}", e))?;

    // Update state
    if let (Ok(mut mods), Ok(mut c)) = (
        current_shortcut.modifiers.lock(),
        current_shortcut.code.lock(),
    ) {
        *mods = if modifiers.is_empty() { None } else { Some(modifiers) };
        *c = code;
    }

    // Save configuration to file for persistence
    let app_data_dir = app.path().app_local_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let config = serde_json::json!({
        "ctrlKey": ctrl_key,
        "shiftKey": shift_key,
        "altKey": alt_key,
        "key": key
    });

    let config_path = app_data_dir.join("shortcut.json");
    let mut file = fs::File::create(&config_path)
        .map_err(|e| format!("Failed to create shortcut config file: {}", e))?;

    file.write_all(config.to_string().as_bytes())
        .map_err(|e| format!("Failed to write shortcut config: {}", e))?;

    Ok("Shortcut updated successfully".to_string())
}

/// Initialize global shortcuts and set up state
pub fn init(app: &tauri::App) -> Result<CurrentShortcut, Box<dyn std::error::Error>> {
    let app_handle = app.handle();

    // Try to load custom shortcut, fall back to default
    let shortcut_config = load_shortcut_config(app).unwrap_or_else(|_| ShortcutKey {
        ctrl_key: true,
        shift_key: true,
        alt_key: false,
        key: "m".to_string(),
    });

    // Build modifiers
    let mut modifiers = Modifiers::empty();
    if shortcut_config.ctrl_key {
        modifiers |= Modifiers::SUPER;
    }
    if shortcut_config.shift_key {
        modifiers |= Modifiers::SHIFT;
    }
    if shortcut_config.alt_key {
        modifiers |= Modifiers::ALT;
    }

    // Get code
    let code = string_to_code(&shortcut_config.key)
        .unwrap_or(Code::KeyM);

    // Register shortcut using on_shortcut
    app_handle.global_shortcut().on_shortcut(
        Shortcut::new(if modifiers.is_empty() { None } else { Some(modifiers) }, code),
        |app, _shortcut, _event| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        },
    )?;

    // Create and return CurrentShortcut state
    Ok(CurrentShortcut {
        modifiers: Mutex::new(if modifiers.is_empty() { None } else { Some(modifiers) }),
        code: Mutex::new(code),
        is_disabled: Mutex::new(false),
    })
}
