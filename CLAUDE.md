# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コーディング規約

### 言語使用
- **【MUST】コード内のコメント、文字列リテラル、ユーザー向けメッセージは全て英語で記述する**
- 例外: このドキュメント (CLAUDE.md) および README.md は日本語可

### コメント記述
- コードの意図を明確に説明する英語コメントを記述
- 複雑なロジックには必ずコメントを付ける
- TODO/FIXME などのマーカーも英語で記述

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
  - テキストエリアの状態管理 (`useState`) と ref ベースのフォーカス管理
  - グローバルショートカットとの連携 (`listen('new-memo')`) - mode パラメータ対応
  - ウィンドウフォーカス検知 (`onFocusChanged`) でフォーカス時に textarea にフォーカス
  - キーボードイベント処理 (Esc で閉じる、⌘+C でコピー)
- **src/App.css**: グラスモーフィズム UI スタイル定義

### バックエンド構造 (Rust)

- **src-tauri/src/main.rs**: Tauri アプリケーションのエントリーポイント
  - **システムトレイ設定** (`TrayIconBuilder`):
    - メニュー項目: "Show"、"Quit"
    - 左クリックでウィンドウ表示
  - **グローバルショートカット登録** (2つ):
    - **表示/フォーカス** (line 61-80): `⌘ + Shift + M` (main.rs:66)
      - ウィンドウが非表示なら表示、既に表示されている場合はフォーカスのみ
    - **新規メモ** (line 83-106): `⌘ + Shift + N` (main.rs:90)
      - トグル動作: 表示時は非表示に、非表示時は表示してフォーカス
      - 表示時に `new-memo` イベントを `{ "mode": "new" }` とともに emit してフロントエンドのテキストをクリア
  - **ウィンドウ管理**:
    - 初期状態は非表示 (main.rs:54)
    - `skipTaskbar` で常駐アプリとして振る舞う
    - `decorations: true`, `transparent: false` (tauri.conf.json)

### 重要な設定ファイル

- **src-tauri/tauri.conf.json**:
  - `windows[0]`: ウィンドウ設定 (サイズ、装飾あり、透明なし)
  - `trayIcon`: トレイアイコン設定
  - `capabilities`: パーミッション設定 (`main-capability.json` 参照)

- **src-tauri/Cargo.toml**:
  - Tauri プラグイン: `global-shortcut`、`clipboard-manager`、`shell`
  - `macos-private-api` feature: macOS プライベート API を使用

### イベントフロー

#### 新規メモ作成 (⌘+Shift+N)
1. ユーザーがグローバルショートカット (⌘+Shift+N) を押下
2. Rust 側でウィンドウの表示/非表示をトグル
3. 表示時に `new-memo` イベントを `{ "mode": "new" }` とともに emit
4. React 側で `listen<{ mode?: string }>('new-memo')` がイベントをキャッチ
5. mode が "new" の場合、テキストエリアをクリアしてフォーカス

#### ウィンドウフォーカス時
1. ウィンドウがフォーカスを取得
2. `onFocusChanged` イベントが発火
3. `textareaRef` または `querySelector` でテキストエリアにフォーカス

## カスタマイズ

### グローバルショートカット変更

2つのショートカットがあります:

**表示/フォーカス** (`src-tauri/src/main.rs:66`):
```rust
Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM)
```

**新規メモ** (`src-tauri/src/main.rs:90`):
```rust
Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN)
```

変更例:
```rust
// ⌘ + K に変更
Shortcut::new(Some(Modifiers::SUPER), Code::KeyK)

// ⌘ + Option + N に変更
Shortcut::new(Some(Modifiers::SUPER | Modifiers::ALT), Code::KeyN)
```

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
