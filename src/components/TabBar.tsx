import { useStore } from '../store';
import { TabItem } from './TabItem';

/**
 * Clipboard icon SVG component
 */
function ClipboardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  );
}

export function TabBar() {
  const { notes, activeId, setActive, deleteNote } = useStore();
  const n = notes.length;

  const handleTabClick = (id: string) => {
    setActive(id);
  };

  const handleTabContextMenu = (id: string) => {
    deleteNote(id);
  };

  return (
    <div className="tab-bar">
      {/* Left Spacer */}
      <div className="tab-spacer-left" />

      {/* Center Tabs */}
      <div
        className="tab-center"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n || 1}, 1fr)`,
        }}
      >
        {notes.map((note) => (
          <TabItem
            key={note.id}
            note={note}
            isActive={activeId === note.id}
            onClick={handleTabClick}
            onContextMenu={handleTabContextMenu}
          />
        ))}
      </div>

      {/* Right Status */}
      <div className="tab-status-right">
        <div className="copy-status-icon">
          <ClipboardIcon />
        </div>
      </div>
    </div>
  );
}
