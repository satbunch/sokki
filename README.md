# Sokki

> Jot your thoughts down.

Sokki is a lightning-fast, minimalist macOS-native memo app built for keyboard-driven workflows. With a single shortcut, it instantly opens a focused text area so you can capture your thoughts without losing momentum.

---

## ✨ Features

- **Global shortcut** (default: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd>) to bring up the memo window from anywhere
- **Immediate input**: text area is auto-focused upon window activation
- **Multiple memos**: manage memos via tabbed interface
- **Quick copy**: <kbd>Cmd</kbd> + <kbd>C</kbd> copies entire memo content
- **Quick close**: <kbd>Esc</kbd> hides the window (memo content is preserved)
- **Tab control**: <kbd>Cmd</kbd> + <kbd>N</kbd> for new tab, <kbd>Cmd</kbd> + <kbd>W</kbd> to close tab
- **Settings UI** for customizing shortcuts, theme, opacity, and tab limits
- **Persistent storage**: memos and settings are saved locally across sessions
- **Tray integration**: app runs in the background with Show/Quit menu
- **macOS menu bar**: native menu integration with keyboard shortcuts

---

## 📸 Screenshots

![Main window](./docs/assets/screenshot.png)

---

## 🚀 Installation

### Option 1: Prebuilt (Recommended)

Download the latest `.dmg` file from the [Releases page](https://github.com/satbunch/sokki/releases) and install it on macOS.

### Option 2: Build from Source

```bash
git clone https://github.com/satbunch/sokki.git
cd sokki
npm install
npm run tauri dev
```

Requirements:
- Node.js >= 18
- Rust (via rustup)
- Tauri CLI (`cargo install tauri-cli`)

---

## 🎹 Keyboard Shortcuts

| Shortcut                   | Action                           |
|---------------------------|----------------------------------|
| Cmd + Shift + M           | Show & focus memo window         |
| Esc                       | Hide window                      |
| Cmd + N                   | Open new memo tab                |
| Cmd + W                   | Close current tab                |
| Cmd + C                   | Copy current memo to clipboard   |

*All bindings are configurable from the Settings screen.*

---

## ⚙️ Settings

You can configure the following from the built-in settings window:

- Global shortcut key
- Maximum number of open tabs
- Theme: light / dark / system
- Window opacity

Open Settings via `Cmd + ,` or from the macOS menu bar.

---

## 💾 Data Persistence

All memos and configuration are stored locally and automatically restored when you relaunch the app.

---

## 🤝 Contributing

We welcome pull requests and feedback!

### Setup
```bash
git clone https://github.com/satbunch/sokki.git
cd sokki
npm install
npm run tauri dev
```

### Guidelines
- Follow existing code style and conventions
- Submit PRs with clear intent and context
- See [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon)

---

## 🛡 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 👤 Maintainer

Sokki is developed and maintained by [@satbunch](https://github.com/satbunch).

---

## 🔒 Security

If you discover a vulnerability, please report it privately via GitHub issues or contact the maintainer directly.

---

## 📦 Version

Current release: **v0.1.0**

Changelog and tagging will begin in future minor versions.
