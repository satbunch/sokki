import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useStore } from './store';
import { Editor } from './components/Editor';
import { TabBar } from './components/TabBar';
import { Settings } from './components/Settings';
import './App.css';

function App() {
  const { init, createNewNote, activeId, deleteNote } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    init();
  }, [init]);

  // Listen to new-memo event to create new note
  useEffect(() => {
    const unlistenNewMemoPromise = listen<{ mode?: string }>(
      'new-memo',
      () => {
        createNewNote();
      }
    );

    return () => {
      unlistenNewMemoPromise.then((unlisten) => unlisten());
    };
  }, [createNewNote]);

  // Listen to delete-tab event from Rust shortcut (Cmd+W)
  useEffect(() => {
    const unlistenDeleteTabPromise = listen(
      'delete-tab',
      () => {
        if (activeId) {
          deleteNote(activeId);
        }
      }
    );

    return () => {
      unlistenDeleteTabPromise.then((unlisten) => unlisten());
    };
  }, [activeId, deleteNote]);

  // Listen to copy-content event from Rust shortcut (Cmd+C)
  useEffect(() => {
    const unlistenCopyContentPromise = listen(
      'copy-content',
      () => {
        // Delegate to Editor component to handle copying
        const event = new CustomEvent('rust-copy-content');
        window.dispatchEvent(event);
      }
    );

    return () => {
      unlistenCopyContentPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Open settings with Cmd+, or menu click
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Listen to settings menu event
  useEffect(() => {
    const unlistenPromise = listen('settings-menu', () => {
      setShowSettings(true);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <div className="container">
      <Editor />
      <TabBar />
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
