import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useStore } from './store';
import { Editor } from './components/Editor';
import { TabBar } from './components/TabBar';
import './App.css';

function App() {
  const { init, createNewNote } = useStore();

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

  return (
    <div className="container">
      <Editor />
      <TabBar />
    </div>
  );
}

export default App;
