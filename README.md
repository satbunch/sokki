# BlinkNote - Ultra-Lightweight Resident Memo App

A minimalist, lightning-fast note-taking app for macOS with a beautiful Mac-native design. Built with Tauri.

## Features

- 🚀 **Ultra-Lightweight**: Only 10-20MB memory usage
- ⚡️ **Instant Launch**: Summon with keyboard shortcut
- 🎨 **Mac-Native Design**: Glassmorphic UI with soft aesthetics
- 🌓 **Dark Mode Support**: Automatically follows system preferences

## Keyboard Shortcuts

- `⌘ + Shift + N`: Show/Hide window
- `⌘ + C`: Copy all text (when no text is selected)
- `Esc`: Close window

## Prerequisites

- Node.js 18+
- Rust (for Tauri)
- macOS
- Xcode Command Line Tools

### Installing Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Installing Xcode Command Line Tools

```bash
xcode-select --install
```

## Setup

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
blink-note/
├── src/
│   ├── App.tsx          # Main React component
│   ├── App.css          # Styles
│   └── main.tsx         # Entry point
├── src-tauri/
│   ├── src/
│   │   └── main.rs      # Rust backend
│   ├── capabilities/
│   │   └── main-capability.json  # Permission settings
│   ├── tauri.conf.json  # Tauri configuration
│   └── Cargo.toml       # Rust dependencies
├── package.json
└── vite.config.ts
```

## Customization

### Change Keyboard Shortcut

Edit `src-tauri/src/main.rs` around line 61:

```rust
Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN),
```

Examples:
- `⌘ + M`: `Shortcut::new(Some(Modifiers::SUPER), Code::KeyM)`
- `⌘ + Option + N`: `Shortcut::new(Some(Modifiers::SUPER | Modifiers::ALT), Code::KeyN)`

### Adjust Window Size

Edit `src-tauri/tauri.conf.json`:

```json
"width": 600,
"height": 400,
```

### Customize Design

Edit `src/App.css` to adjust colors, transparency, and styling.

## Troubleshooting

### Shortcut Not Working

- Grant Accessibility permissions in System Settings > Privacy & Security > Accessibility
- Check for conflicts with other apps' shortcuts

### Build Errors

```bash
# Clear cache
rm -rf node_modules
rm -rf src-tauri/target
npm install
```

## License

MIT
