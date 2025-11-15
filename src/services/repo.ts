/**
 * Repository layer for managing application state persistence.
 * Abstracts storage implementation (localStorage for now, Tauri later).
 * This layer is responsible for:
 * - Loading/saving application state
 * - Type validation and normalization
 * - Storage key management
 */

import type { AppStateShape, Note, Settings, NoteId } from '../types';

const STORAGE_KEY = 'sokki_state_v1';

/**
 * Validates and normalizes a Note object.
 * Ensures all required fields are present and of correct type.
 */
function validateNote(note: unknown): Note | null {
  if (typeof note !== 'object' || note === null) return null;

  const n = note as Record<string, unknown>;

  if (
    typeof n.id !== 'string' ||
    typeof n.content !== 'string' ||
    typeof n.preview !== 'string' ||
    typeof n.createdAt !== 'string' ||
    typeof n.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: n.id as NoteId,
    content: n.content,
    preview: n.preview,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

/**
 * Validates and normalizes Settings object.
 * Clamps maxTabs to valid range [3, 30], defaults to 10 if invalid.
 * Clamps opacity to valid range [0, 100], defaults to 80 if invalid.
 */
function validateSettings(settings: unknown): Settings {
  if (typeof settings !== 'object' || settings === null) {
    return { maxTabs: 10, opacity: 80 };
  }

  const s = settings as Record<string, unknown>;
  const maxTabs = typeof s.maxTabs === 'number' ? s.maxTabs : 10;
  const opacity = typeof s.opacity === 'number' ? s.opacity : 80;

  // Clamp to valid range [3, 30] for maxTabs and [0, 100] for opacity
  return {
    maxTabs: Math.max(3, Math.min(30, Math.round(maxTabs))),
    opacity: Math.max(0, Math.min(100, Math.round(opacity))),
  };
}

/**
 * Validates and normalizes AppStateShape.
 * Ensures type safety and fixes invalid data.
 */
function validateAppState(state: unknown): AppStateShape {
  if (typeof state !== 'object' || state === null) {
    return {
      notes: [],
      activeId: null,
      settings: { maxTabs: 10, opacity: 80 },
    };
  }

  const s = state as Record<string, unknown>;

  // Validate notes array
  let notes: Note[] = [];
  if (Array.isArray(s.notes)) {
    notes = s.notes
      .map(validateNote)
      .filter((note): note is Note => note !== null);
  }

  // Validate activeId
  let activeId: NoteId | null = null;
  if (typeof s.activeId === 'string') {
    activeId = s.activeId;
  }

  // Validate settings
  const settings = validateSettings(s.settings);

  return {
    notes,
    activeId,
    settings,
  };
}

/**
 * Repository API for state persistence.
 */
export const repo = {
  /**
   * Load application state from storage.
   * Returns validated state or default state if not found.
   */
  async loadAll(): Promise<AppStateShape> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          notes: [],
          activeId: null,
          settings: { maxTabs: 10, opacity: 80 },
        };
      }

      const parsed = JSON.parse(stored);
      return validateAppState(parsed);
    } catch (error) {
      // Log error but don't throw - return default state on any error
      console.error('[repo] Error loading state:', error);
      return {
        notes: [],
        activeId: null,
        settings: { maxTabs: 10, opacity: 80 },
      };
    }
  },

  /**
   * Save application state to storage.
   * Validates state before saving.
   */
  async saveAll(state: AppStateShape): Promise<void> {
    try {
      const validated = validateAppState(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('[repo] Error saving state:', error);
      throw new Error('Failed to save application state');
    }
  },
};
