import { useEffect, useState, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { listen } from '@tauri-apps/api/event';
import './App.css';

const appWindow = getCurrentWindow();

function App() {
  const [text, setText] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const focusTextarea = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      } else {
        document.querySelector('textarea')?.focus();
      }
    }, 50);
  };

  const handleCopy = async () => {
    if (text) {
      await writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1500);
    }
  };

  useEffect(() => {
    // Listen to new-memo event once
    const unlistenNewMemoPromise = listen<{ mode?: string }>(
      'new-memo',
      () => {
        // Reload to clear state and start fresh
        window.location.reload();
      }
    );

    // Focus textarea when window gains focus
    const unlistenFocusPromise = appWindow.onFocusChanged(
      ({ payload: focused }) => {
        if (focused) {
          focusTextarea();
        }
      }
    );

    // Hide window on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        appWindow.hide();
      }
      // Copy all text with Cmd+C / Ctrl+C when no text is selected
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const selection = window.getSelection()?.toString();
        if (!selection && text) {
          e.preventDefault();
          handleCopy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    focusTextarea();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlistenNewMemoPromise.then((unlisten) => unlisten());
      unlistenFocusPromise.then((unlisten) => unlisten());
    };
  }, [text]);

  return (
    <div className="container">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note..."
        autoFocus
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            appWindow.hide();
          }
        }}
      />

      <div className="footer">
        <div className="shortcuts">
          <span className="shortcut">⌘⇧M Show</span>
          <span className="shortcut">⌘⇧N New</span>
          <span className="shortcut">⌘C Copy</span>
          <span className="shortcut">Esc Close</span>
        </div>
        <button
          className={`copy-button ${showCopied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={!text}
        >
          {showCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default App;
