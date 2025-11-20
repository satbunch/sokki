import { listen } from '@tauri-apps/api/event';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { invoke } from '@tauri-apps/api/core';

/**
 * Type definitions for app command handlers
 */
export interface CommandHandlers {
  onCopyContent: () => Promise<void>;
  onNewMemo: () => void;
  onDeleteTab: () => void;
  onQuit: () => void;
}

/**
 * Copy content to clipboard
 */
export async function copyContent(content: string): Promise<void> {
  if (content) {
    await writeText(content);
  }
}

/**
 * Set up keyboard shortcut listeners for the application
 * Handles local shortcuts: Cmd+C (Copy), Cmd+N (New Tab), Cmd+W (Delete Tab), Esc (Hide Window)
 */
export async function setupKeyboardShortcuts(
  handlers: CommandHandlers
): Promise<(() => void)[]> {
  const unlisteners: (() => void)[] = [];

  // Listen to copy-content event from menu or keyboard shortcut
  const unlistenCopyContent = await listen('copy-content', () => {
    handlers.onCopyContent();
  });
  unlisteners.push(unlistenCopyContent);

  // Listen to new-tab event from menu or keyboard shortcut
  const unlistenNewTab = await listen('new-tab', () => {
    handlers.onNewMemo();
  });
  unlisteners.push(unlistenNewTab);

  // Listen to delete-tab event from menu or keyboard shortcut
  const unlistenDeleteTab = await listen('delete-tab', () => {
    handlers.onDeleteTab();
  });
  unlisteners.push(unlistenDeleteTab);

  // Handle keyboard shortcuts locally (Sokki window only)
  const handleKeydown = async (e: KeyboardEvent) => {
    // Cmd+C - Copy
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      e.preventDefault();
      await handlers.onCopyContent();
      return;
    }

    // Cmd+N - New Tab
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      handlers.onNewMemo();
      return;
    }

    // Cmd+W - Delete Tab
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault();
      handlers.onDeleteTab();
      return;
    }

    // Esc - Hide Window
    if (e.key === 'Escape') {
      e.preventDefault();
      invoke('hide_app_and_focus_previous').catch(console.error)
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
      e.preventDefault();
      handlers.onQuit();
    }
  };

  window.addEventListener('keydown', handleKeydown);
  unlisteners.push(() => window.removeEventListener('keydown', handleKeydown));

  return unlisteners;
}
