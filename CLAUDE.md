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

**Sokki** は macOS 向けの超軽量・常駐型メモアプリケーション。Tauri (Rust + React) で構築され、グローバルショートカットで瞬時に起動できる Mac ネイティブデザインを採用している。

### 技術スタック
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Tauri 2.x (Rust)
- **主要依存**:
  - `tauri-plugin-global-shortcut`: グローバルショートカット管理
  - `tauri-plugin-clipboard-manager`: クリップボード操作
  - `tauri-plugin-shell`: シェル操作
  - `tailwindcss` + `@tailwindcss/postcss`: スタイリング

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

```
src/
├── main.tsx                    # React エントリーポイント
├── App.tsx                     # メインコンポーネント
├── App.css                     # Tailwind CSS + カスタムスタイル
├── components/                 # UI コンポーネント
│   ├── Editor.tsx             # テキストエディタ
│   ├── TabBar.tsx             # タブバー
│   ├── TabItem.tsx            # タブアイテム
│   ├── Settings.tsx           # 設定パネル
│   └── ...
├── services/                   # ビジネスロジック層
│   ├── store.ts               # Zustand ストア (状態管理)
│   └── repo.ts                # リポジトリ (永続化層)
├── types/                      # 型定義
│   └── index.ts               # ドメイン型
├── lib/                        # ライブラリ層
│   └── commands/              # Tauri コマンド
├── utils/                      # ユーティリティ関数
└── theme/                      # テーマ管理
    ├── ThemeContext.tsx       # テーマプロバイダ
    └── tokens.css             # テーマトークン
```

#### 主要ファイル説明

- **src/main.tsx**: React エントリーポイント、ストア初期化
- **src/App.tsx**: メインコンポーネント
  - テキストエリアの状態管理と ref ベースのフォーカス管理
  - グローバルショートカットとの連携 (`listen('new-memo')`) - mode パラメータ対応
  - ウィンドウフォーカス検知 (`onFocusChanged`) でフォーカス時に textarea にフォーカス
  - ローカルキーボード処理:
    - **⌘+, (Cmd+Comma)** — 設定画面をトグル表示
    - **Esc** — ウィンドウを非表示

- **src/services/store.ts**: Zustand による状態管理
  - `useStore`: グローバルストア (notes, activeId, settings など)
  - 状態の変更は自動的にリポジトリレイヤーで永続化

- **src/services/repo.ts**: リポジトリ層（永続化の抽象化）
  - `repo.loadAll()`: localStorage からの読み込み
  - `repo.saveAll(state)`: localStorage への保存

- **src/types/index.ts**: ドメイン型定義
  - `Note`: メモデータ型
  - `AppStateShape`: アプリケーションの状態形
  - `NoteId`, `IsoDate`: ブランド型

### バックエンド構造 (Rust)

- **src-tauri/src/main.rs**: Tauri アプリケーションのエントリーポイント
  - **システムトレイ設定** (`TrayIconBuilder`):
    - メニュー項目: "Show"、"Quit"
    - 左クリックでウィンドウ表示
  - **グローバルショートカット登録**:
    - **表示/フォーカス** — `⌘ + Shift + M` (src-tauri/src/shortcuts.rs)
      - ウィンドウが非表示なら表示、既に表示されている場合はフォーカスのみ
  - **ウィンドウ管理**:
    - 初期状態は非表示
    - `skipTaskbar` で常駐アプリとして振る舞う
    - `decorations: true`, `transparent: false` (tauri.conf.json)

- **src/lib/commands/app-commands.ts**: ローカルキーボード処理 (Sokki ウィンドウが表示時のみ)
  - **⌘+C** — クリップボードにコピー
  - **⌘+N** — 新規メモ作成（テキスト内容をクリア、フォーカス）
  - **⌘+W** — 現在のメモ削除
  - **Esc** — ウィンドウを非表示

### 重要な設定ファイル

- **src-tauri/tauri.conf.json**:
  - `windows[0]`: ウィンドウ設定 (サイズ、装飾あり、透明なし)
  - `trayIcon`: トレイアイコン設定
  - `capabilities`: パーミッション設定 (`main-capability.json` 参照)

- **src-tauri/Cargo.toml**:
  - Tauri プラグイン: `global-shortcut`、`clipboard-manager`、`shell`
  - `macos-private-api` feature: macOS プライベート API を使用

## スタイル管理

### Tailwind CSS v4 統合

このプロジェクトは **Tailwind CSS v4** を使用してスタイリングを行っています。

#### ファイル構成

- **src/App.css**: メインスタイルシート
  - `@import "tailwindcss"` でTailwind CSS v4をインポート
  - CSS変数を使用したカスタムテーマ定義
  - コンポーネント固有のスタイル

- **tailwind.config.js**: Tailwind設定ファイル
- **postcss.config.js**: PostCSS設定（`@tailwindcss/postcss`を使用）

### CSS 変数の一元管理

**src/App.css** で色・シャドウ・背景をすべて一元管理しています。テーマ変更やスタイル修正時は、必ず App.css の CSS 変数を使用してください。

#### CSS 変数の定義階層

1. **`:root`（デフォルト / ライトテーマ）**
   - **基本色**: `--color-primary`, `--color-success`, `--color-error`
   - **背景**: `--bg-container`, `--bg-header`, `--bg-tabbar`, `--bg-editor`, `--bg-icon`
   - **テキスト**: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-quaternary`, `--text-tooltip`
   - **ボーダー**: `--border-light`, `--border-dark`
   - **オーバーレイ**: `--overlay-subtle`, `--overlay-button-bg`, `--overlay-hover`, `--overlay-active`, `--overlay-disabled`, `--overlay-modal-bg`
   - **シャドウ**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-tooltip`
   - **フォーカス状態**: `--focus-primary`, `--shadow-primary-sm`, `--shadow-primary-md`, `--shadow-success-sm`
   - **スクロールバー**: `--scrollbar-default`, `--scrollbar-hover`

2. **`:root[data-theme="light"]`**
   - ライトテーマ専用の上書き（同じ変数名で値を上書き）

3. **`:root[data-theme="dark"]`**
   - ダークテーマ（`--bg-editor: rgba(73, 73, 76, 1)` など）

4. **`@media (prefers-color-scheme: dark)`**
   - ブラウザのシステム設定フォールバック（`data-theme` が未指定時）

#### スタイリング方法

1. **Tailwind ユーティリティクラス（推奨）**: `className="flex items-center gap-2"`
2. **CSS変数を使用したカスタムスタイル**: `background: var(--bg-tabbar);`
3. **既存のクラス**: `.container`, `.tab-bar`, `.settings-overlay` など

#### 新しいスタイルを追加する場合

```tsx
// Tailwindユーティリティクラスを使用
<div className="flex items-center justify-center p-4 rounded-lg bg-blue-500 text-white">
  Content
</div>

// CSS変数を使用する場合（テーマ対応が必要な場合）
<div style={{ background: 'var(--bg-editor)', color: 'var(--text-primary)' }}>
  Content
</div>
```

#### 色の使用規則（【MUST】）

- **直書き禁止**: `background: rgba(50, 50, 50);` ❌
- **Tailwindまたは変数使用必須**: `className="bg-gray-800"` または `background: var(--bg-tabbar);` ✅
- テーマ依存性が高い色（背景、テキスト、シャドウ）は**必ず** CSS 変数を使う
- Tailwindのユーティリティクラスは、テーマに依存しない固定色やレイアウトに使用

## カスタマイズ

### グローバルショートカット変更

**表示/フォーカス** (`src-tauri/src/shortcuts.rs:14`):
```rust
Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM)
```

変更例 (⌘ + Shift + K に変更):
```rust
Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyK)
```

### ローカルショートカット変更

**クリップボード、新規メモ、削除** (`src/lib/commands/app-commands.ts:50-80`):

現在の実装:
- **⌘+C** — クリップボードにコピー
- **⌘+N** — 新規メモ作成
- **⌘+W** — メモ削除
- **Esc** — ウィンドウ非表示

キーコード部分を編集して変更可能です（例：`e.key === 'c'` を別のキーに変更）。

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
