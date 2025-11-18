/**
 * Tauri backend command invocations
 */

import { invoke } from '@tauri-apps/api/core';
import type { ShortcutKey } from '../../types';

/**
 * Update global shortcut in Rust backend
 * @param shortcut - New shortcut key configuration
 */
export async function updateGlobalShortcut(shortcut: ShortcutKey): Promise<void> {
  try {
    await invoke('update_global_shortcut', {
      ctrlKey: shortcut.ctrlKey,
      shiftKey: shortcut.shiftKey,
      altKey: shortcut.altKey,
      key: shortcut.key,
    });
  } catch (error) {
    console.error('[tauri-commands] Failed to update global shortcut:', error);
    throw error;
  }
}

/**
 * Enable/disable global shortcut
 * @param enabled - Whether to enable (true) or disable (false) the global shortcut
 */
export async function setGlobalShortcutEnabled(enabled: boolean): Promise<void> {
  try {
    await invoke('set_global_shortcut_enabled', { enabled });
  } catch (error) {
    console.error('[tauri-commands] Failed to set global shortcut enabled:', error);
    throw error;
  }
}
