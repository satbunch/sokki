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
  }

  const handleCopy = async () => {
    if (text) {
      await writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1500);
    }
  };

  useEffect(() => {
    // new-mwmoを1回だけリッスン
    const unlistenNewMemoPromise = listen<{ mode?: string }>('new-memo', (e) => {
      //将来 mode を渡す想定。今は毎回初期化になってるならここで絞る
      const mode = e.payload?.mode ?? 'new';
      if (mode === 'new') {
        setText('');
      }
      focusTextarea();
    });

    // フォーカスが戻ってきた時だけtextareaにフォーカスする
    const unlistenFocusPromise = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        focusTextarea();
      }
    });

    // Escキーで閉じる
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        appWindow.hide();
      }
      // Cmd+C または Ctrl+C でコピー（テキスト選択がない場合）
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
  }, []);


  return (
    <div className="container">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="メモを入力..."
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
          <span className="shortcut">⌘⇧Space 起動/閉じる</span>
          <span className="shortcut">⌘C コピー</span>
          <span className="shortcut">Esc 閉じる</span>
        </div>
        <button
          className={`copy-button ${showCopied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={!text}
        >
          {showCopied ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
    </div>
  );
}

export default App;
