/**
 * Zustand store for centralized state management.
 * Handles state updates and persists to localStorage via repository layer.
 */

import { create } from 'zustand';
import { debounce } from './utils/debounce';
import { repo } from './repo';
import type { AppStateShape, Note, NoteId, IsoDate } from './types';

/**
 * Store state and action types.
 */
interface Store extends AppStateShape {
  // Transient state (not persisted)
  copyStatus: 'idle' | 'copied';

  // Selectors
  activeNote: () => Note | null;

  // Actions
  init: () => Promise<void>;
  setActive: (id: NoteId | null) => void;
  upsertNoteContent: (id: NoteId, content: string) => void;
  createNewNote: () => void;
  deleteNote: (id: NoteId) => void;
  setMaxTabs: (n: number) => void;
  setOpacity: (opacity: number) => void;
  setCopyStatus: (status: 'idle' | 'copied') => void;
}

/**
 * Helper function to generate ISO date string.
 */
function now(): IsoDate {
  return new Date().toISOString();
}

/**
 * Helper function to generate a unique note ID.
 */
function generateNoteId(): NoteId {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to create preview from content.
 * Takes first line, max 80 characters.
 */
function createPreview(content: string): string {
  const firstLine = content.split('\n')[0];
  return firstLine.slice(0, 80);
}

/**
 * Create debounced save function.
 * Debounce saveAll with default 400ms.
 */
const debouncedSaveAll = debounce(
  (state: AppStateShape) => {
    repo.saveAll(state).catch((error) => {
      console.error('[store] Error saving state:', error);
    });
  },
  { wait: 400, leading: false, trailing: true }
);

/**
 * Zustand store with state management and actions.
 */
export const useStore = create<Store>((set, get) => ({
  // Initial state
  notes: [],
  activeId: null,
  settings: { maxTabs: 10, opacity: 80 },
  copyStatus: 'idle',

  // Selector: Get currently active note
  activeNote: () => {
    const { notes, activeId } = get();
    if (activeId === null) return null;
    return notes.find((note) => note.id === activeId) ?? null;
  },

  // Action: Initialize store from repository and ensure empty note exists
  init: async () => {
    const state = await repo.loadAll();
    set(state);

    // Ensure at least one empty note is active
    const { notes } = get();
    if (notes.length === 0) {
      get().createNewNote();
    } else {
      // Ensure first note is active
      set({ activeId: notes[0].id });
    }
  },

  // Action: Set active note by ID
  setActive: (id: NoteId | null) => {
    set({ activeId: id });
  },

  // Action: Update note content with debounced save
  upsertNoteContent: (id: NoteId, content: string) => {
    set((state) => {
      const noteIndex = state.notes.findIndex((note) => note.id === id);
      if (noteIndex === -1) return state;

      const preview = createPreview(content);
      const updatedNote: Note = {
        ...state.notes[noteIndex],
        content,
        preview,
        updatedAt: now(),
      };

      const newNotes = [...state.notes];
      newNotes[noteIndex] = updatedNote;

      const newState: AppStateShape = {
        ...state,
        notes: newNotes,
      };

      // Trigger debounced save
      debouncedSaveAll(newState);

      return newState;
    });
  },

  // Action: Create new note and set as active
  createNewNote: () => {
    set((state) => {
      const newNote: Note = {
        id: generateNoteId(),
        content: '',
        preview: '',
        createdAt: now(),
        updatedAt: now(),
      };

      // Add to beginning (newest first)
      const notes = [newNote, ...state.notes];

      // Enforce max tabs by removing oldest (FIFO)
      if (notes.length > state.settings.maxTabs) {
        notes.pop();
      }

      const newState: AppStateShape = {
        ...state,
        notes,
        activeId: newNote.id,
      };

      // Save to repository
      debouncedSaveAll(newState);

      return newState;
    });
  },

  // Action: Delete note by ID
  deleteNote: (id: NoteId) => {
    set((state) => {
      const notes = state.notes.filter((note) => note.id !== id);
      let activeId = state.activeId;

      // If deleted note was active, activate first note or null
      if (activeId === id) {
        activeId = notes.length > 0 ? notes[0].id : null;
      }

      const newState: AppStateShape = {
        ...state,
        notes,
        activeId,
      };

      // Save to repository
      debouncedSaveAll(newState);

      return newState;
    });
  },

  // Action: Set max tabs and adjust notes if needed
  setMaxTabs: (n: number) => {
    set((state) => {
      // Clamp to valid range [3, 30]
      const maxTabs = Math.max(3, Math.min(30, Math.round(n)));

      // Trim notes if exceeding new limit
      const notes =
        state.notes.length > maxTabs
          ? state.notes.slice(0, maxTabs)
          : state.notes;

      // Ensure activeId is still valid
      let activeId = state.activeId;
      if (activeId !== null && !notes.find((note) => note.id === activeId)) {
        activeId = notes.length > 0 ? notes[0].id : null;
      }

      const newState: AppStateShape = {
        ...state,
        notes,
        activeId,
        settings: { ...state.settings, maxTabs },
      };

      // Save to repository
      debouncedSaveAll(newState);

      return newState;
    });
  },

  // Action: Set window opacity level
  setOpacity: (opacity: number) => {
    set((state) => {
      // Clamp to valid range [0, 100]
      const clampedOpacity = Math.max(0, Math.min(100, Math.round(opacity)));

      const newState: AppStateShape = {
        ...state,
        settings: { ...state.settings, opacity: clampedOpacity },
      };

      // Save to repository
      debouncedSaveAll(newState);

      return newState;
    });
  },

  // Action: Set copy status (transient state)
  setCopyStatus: (status: 'idle' | 'copied') => {
    set({ copyStatus: status });
  },
}));
