/**
 * Domain type definitions for Sokki
 * These types form the foundation of the application state and must not be changed
 * without careful consideration of backward compatibility.
 */

/**
 * Unique identifier for a note.
 */
export type NoteId = string;

/**
 * ISO 8601 date string (e.g., "2024-11-12T15:30:45.123Z").
 */
export type IsoDate = string;

/**
 * Represents a single note in the application.
 */
export type Note = {
  id: NoteId;
  content: string;
  preview: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
};

/**
 * Shortcut key configuration.
 * Stores modifier keys and key code for a shortcut.
 */
export type ShortcutKey = {
  /**
   * Whether Cmd/Ctrl key is pressed
   */
  ctrlKey: boolean;
  /**
   * Whether Shift key is pressed
   */
  shiftKey: boolean;
  /**
   * Whether Alt/Option key is pressed
   */
  altKey: boolean;
  /**
   * The main key pressed (single character)
   */
  key: string;
};

/**
 * Shortcut settings for local keyboard actions.
 */
export type ShortcutSettings = {
  /**
   * Global show/focus window shortcut (default: Cmd+Shift+M)
   */
  globalShow: ShortcutKey;
  /**
   * Copy to clipboard shortcut (default: Cmd+C)
   */
  copy: ShortcutKey;
  /**
   * Create new memo shortcut (default: Cmd+N)
   */
  newMemo: ShortcutKey;
  /**
   * Delete current memo shortcut (default: Cmd+W)
   */
  deleteMemo: ShortcutKey;
};

/**
 * Application settings.
 */
export type Settings = {
  /**
   * Maximum number of tabs allowed (3..30)
   */
  maxTabs: number;
  /**
   * Window opacity level (0..100)
   */
  opacity: number;
  /**
   * Shortcut key settings
   */
  shortcuts: ShortcutSettings;
};

/**
 * The complete shape of the application state.
 */
export type AppStateShape = {
  notes: Note[];
  activeId: NoteId | null;
  settings: Settings;
};
