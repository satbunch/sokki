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
};

/**
 * The complete shape of the application state.
 */
export type AppStateShape = {
  notes: Note[];
  activeId: NoteId | null;
  settings: Settings;
};
