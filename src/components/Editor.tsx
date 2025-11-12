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
  }, [note?.id]);

  /**
   * Listen to copy-content event from Rust shortcut (Cmd+C)
   */
  useEffect(() => {
    const handleRustCopyContent = () => {
      if (content) {
        writeText(content);
        // Show copied status briefly
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 1500);
      }
    };

    window.addEventListener('rust-copy-content', handleRustCopyContent);
    return () => window.removeEventListener('rust-copy-content', handleRustCopyContent);
  }, [content, setCopyStatus]);

  /**
   * Handle text change - save to store immediately
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (note) {
      upsertNoteContent(note.id, e.target.value);
    }
  };

  /**
   * No keyboard shortcuts needed here - all handled by Rust side
   * Editor only focuses on text editing
   */

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      placeholder="Type instantly…"
      autoFocus
      spellCheck={false}
    />
  );
}
