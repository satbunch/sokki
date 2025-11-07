# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**BlinkNote** は macOS 向けの超軽量・常駐型メモアプリケーション。Tauri (Rust + React) で構築され、グローバルショートカットで瞬時に起動できる Mac ネイティブデザインを採用している。

### 技術スタック
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Tauri 2.x (Rust)
- **主要依存**:
  - `tauri-plugin-global-shortcut`: グローバルショートカット管理
  - `tauri-plugin-clipboard-manager`: クリップボード操作
  - `tauri-plugin-shell`: シェル操作

## コマンド

### 開発

```bash
# 開発サーバー起動 (Vite + Tauri)
npm run tauri dev

# Vite のみ起動 (フロントエンド開発)
npm run dev
```

### ビルド

```bash
# TypeScript コンパイル + Vite ビルド
npm run build

# プロダクションビルド (macOS アプリケーション生成)
npm run tauri build
# 成果物: src-tauri/target/release/bundle/
```

### 依存関係

```bash
# 依存関係インストール
npm install

# キャッシュクリア (ビルドエラー時)
rm -rf node_modules src-tauri/target
npm install
```

## アーキテクチャ

### フロントエンド構造

- **src/main.tsx**: React エントリーポイント
- **src/App.tsx**: メインコンポーネント
  - テキストエリアの状態管理 (`useState`)
  - グローバルショートカットとの連携 (`listen('new-memo')`)
  - キーボードイベント処理 (Esc で閉じる、⌘+C でコピー)
- **src/App.css**: グラスモーフィズム UI スタイル定義

### バックエンド構造 (Rust)

- **src-tauri/src/main.rs**: Tauri アプリケーションのエントリーポイント
  - **システムトレイ設定** (`TrayIconBuilder`):
    - メニュー項目: "Show"、"Quit"
    - 左クリックでウィンドウ表示
  - **グローバルショートカット登録** (line 59-77):
    - デフォルト: `⌘ + Shift + N` (main.rs:61)
    - トグル動作: 表示時は非表示に、非表示時は表示してフォーカス
    - 表示時に `new-memo` イベントを emit してフロントエンドのテキストをクリア
  - **ウィンドウ管理**:
    - 初期状態は非表示 (main.rs:56)
    - `alwaysOnTop`、`skipTaskbar` で常駐アプリとして振る舞う

### 重要な設定ファイル

- **src-tauri/tauri.conf.json**:
  - `windows[0]`: ウィンドウ設定 (サイズ、透明度、装飾なし、常に最前面)
  - `trayIcon`: トレイアイコン設定
  - `capabilities`: パーミッション設定 (`main-capability.json` 参照)

- **src-tauri/Cargo.toml**:
  - Tauri プラグイン: `global-shortcut`、`clipboard-manager`、`shell`
  - `macos-private-api` feature: macOS プライベート API を使用

### イベントフロー

1. ユーザーがグローバルショートカット (⌘+Shift+N) を押下
2. Rust 側でウィンドウの表示/非表示をトグル
3. 表示時に `new-memo` イベントを emit
4. React 側で `listen('new-memo')` がイベントをキャッチ
5. テキストエリアをクリアしてフォーカス

## カスタマイズ

### グローバルショートカット変更

`src-tauri/src/main.rs:61` を編集:

```rust
// 例: ⌘ + M に変更
Shortcut::new(Some(Modifiers::SUPER), Code::KeyM)

// 例: ⌘ + Option + N に変更
Shortcut::new(Some(Modifiers::SUPER | Modifiers::ALT), Code::KeyN)
```

**注意**: README.md ではデフォルトが `⌘ + Shift + Space` と記載されているが、実装は `⌘ + Shift + N` になっている。

### ウィンドウサイズ変更

`src-tauri/tauri.conf.json` の `windows[0]` を編集:

```json
"width": 600,
"height": 400,
"minWidth": 400,
"minHeight": 300
```

## トラブルシューティング

### ショートカットが動作しない
- システム設定 > プライバシーとセキュリティ > アクセシビリティ でアプリに権限を付与
- 他のアプリとのショートカット競合を確認

### ビルドエラー
```bash
rm -rf node_modules src-tauri/target
npm install
```

### Rust ツールチェイン未インストール
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Xcode Command Line Tools 未インストール
```bash
xcode-select --install
```
