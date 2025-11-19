/**
 * Utility functions for shortcut key handling
 */

import type { ShortcutKey } from '../types';

/**
 * Extract ShortcutKey from keyboard event
 * @param event - KeyboardEvent
 * @returns ShortcutKey with modifier keys and the main key pressed
 */
export function extractShortcutKey(event: KeyboardEvent): ShortcutKey {
  return {
    ctrlKey: event.metaKey || event.ctrlKey, // metaKey for Cmd on macOS
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    key: event.key.toLowerCase(),
  };
}

/**
 * Format ShortcutKey for display
 * @param shortcut - ShortcutKey to format
 * @returns Human-readable string representation
 */
export function formatShortcut(shortcut: ShortcutKey): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) {
    parts.push('Cmd');
  }
  if (shortcut.shiftKey) {
    parts.push('Shift');
  }
  if (shortcut.altKey) {
    parts.push('Option');
  }

  // Capitalize the main key
  const mainKey = shortcut.key.toUpperCase();
  parts.push(mainKey);

  return parts.join('+');
}

/**
 * Check if a keyboard event is a valid shortcut
 * A valid shortcut must have:
 * - At least one modifier key (Cmd, Shift, Alt/Option)
 * - A regular key (not just a modifier key)
 * @param event - KeyboardEvent
 * @returns true if this event represents a valid shortcut
 */
export function isValidShortcut(event: KeyboardEvent): boolean {
  const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  // List of modifier-only keys that shouldn't count as the main key
  const modifierOnlyKeys = [
    'Control',
    'Meta',
    'Shift',
    'Alt',
    'AltGraph',
    'OS',
  ];

  // List of special keys that can't be used as the main key
  const specialKeys = [
    'Enter',
    'Escape',
    'Tab',
    ' ',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ];

  const isMainKeyValid = !modifierOnlyKeys.includes(event.key) && !specialKeys.includes(event.key);

  return hasModifier && isMainKeyValid;
}
