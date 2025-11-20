import { useRef, useEffect } from 'react';
import { useStore } from '../services/store';
import { setupKeyboardShortcuts, copyContent } from '../lib/commands/app-commands';
import { invoke } from '@tauri-apps/api/core';

/**
 * Editor component for note editing.
 * Automatically syncs with active note, handles focus, and saves on change.
 */
export function Editor() {
  const { activeNote, upsertNoteContent, setCopyStatus, createNewNote, activeId, deleteNote } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const note = activeNote();
  const content = note?.content ?? '';

  /**
   * Focus textarea when activeNote changes or on window focus
   */
  useEffect(() => {
    const focusEditor = () => {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
    };

    focusEditor();
  }, [note?.id]);

  /**
   * Handle copy action - triggered by menu or keyboard shortcut (Cmd+C)
   */
  const handleCopyContent = async () => {
    if (content) {
      await copyContent(content);
      // Show copied status briefly
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1500);
    }
  };

  /**
   * Handle new memo action - triggered by menu or keyboard shortcut (Cmd+Shift+N)
   */
  const handleNewMemo = () => {
    createNewNote();
  };

  /**
   * Handle delete tab action - triggered by menu or keyboard shortcut (Cmd+W)
   */
  const handleDeleteTab = () => {
    if (activeId) {
      deleteNote(activeId);
    }
  };

  const handleQuit = () => {
    invoke('quit_app').catch(console.error);
  };

  /**
   * Set up keyboard shortcuts (Cmd+C, Cmd+N, Cmd+W, Esc)
   */
  useEffect(() => {
    const setupShortcuts = async () => {
      const unlisteners = await setupKeyboardShortcuts({
        onCopyContent: handleCopyContent,
        onNewMemo: handleNewMemo,
        onDeleteTab: handleDeleteTab,
        onQuit: handleQuit,
      });

      return () => {
        unlisteners.forEach((unlisten) => unlisten());
      };
    };

    const cleanupPromise = setupShortcuts();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [content, setCopyStatus, createNewNote, activeId, deleteNote, handleQuit]);

  /**
   * Handle text change - save to store immediately
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (note) {
      upsertNoteContent(note.id, e.target.value);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      placeholder="Type instantly…"
      autoFocus
      spellCheck={false}
      className="flex-1 outline-none p-5 text-[15px] leading-relaxed resize-none font-sans border-0 editor-textarea"
      style={{
        background: 'var(--bg-editor)',
        color: 'var(--text-primary)',
        borderBottom: '2px solid var(--bg-editor)'
      }}
    />
  );
}
