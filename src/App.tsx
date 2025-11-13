import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from './store';
import { Editor } from './components/Editor';
import { TabBar } from './components/TabBar';
import { Settings } from './components/Settings';
import './App.css';

function App() {
  const { init, settings } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    init();
  }, [init]);

  // Apply window opacity on store load
  useEffect(() => {
    const opacity = settings.opacity;
    const normalizedOpacity = opacity / 100;

    // Apply opacity via Tauri
    invoke('set_window_opacity', { opacity: normalizedOpacity }).catch(
      (error) => {
        console.error('[App] Failed to set window opacity:', error);
      }
    );
  }, [settings.opacity]);


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
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
