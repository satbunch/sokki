import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { useStore } from "./services/store";
import { ThemeProvider } from "./theme/ThemeContext";
import "./theme/tokens.css";

// Initialize store and verify behavior
useStore.getState().init().then(() => {
  const state = useStore.getState();
  const notes = state.notes;
  const activeNote = state.activeNote();

  console.log('[store init test]', {
    notesCount: notes.length,
    firstNoteIsEmpty: notes.length > 0 ? notes[0].content === '' : false,
    activeNoteId: state.activeId,
    activeNoteContent: activeNote ? activeNote.content : null,
  });
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
