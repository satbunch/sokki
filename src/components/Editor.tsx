import { useRef, useEffect } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useStore } from '../store';

/**
 * Editor component for note editing.
 * Automatically syncs with active note, handles focus, and saves on change.
 */
export function Editor() {
  const { activeNote, upsertNoteContent, setCopyStatus } = useStore();
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

    // Also focus when window gains focus
    const unlistenFocusPromise = (async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      return appWindow.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          focusEditor();
        }
      });
    })();

    return () => {
      unlistenFocusPromise.then((unlisten) => unlisten());
    };
  }, [note?.id]);

  /**
   * Handle text change - save to store immediately
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (note) {
      upsertNoteContent(note.id, e.target.value);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape key to hide window
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      (async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();
        appWindow.hide();
      })();
    }

    // Cmd+C / Ctrl+C to copy all text when no selection
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      const selection = window.getSelection()?.toString();
      if (!selection && content) {
        e.preventDefault();
        writeText(content);
        // Show copied status briefly
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 1500);
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Type instantly…"
      autoFocus
      spellCheck={false}
    />
  );
}
