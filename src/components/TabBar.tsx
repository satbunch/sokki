import { useStore } from '../store';
import { TabItem } from './TabItem';
import { Clipboard, Check } from 'lucide-react';

export function TabBar() {
  const { notes, activeId, setActive, deleteNote, copyStatus } = useStore();
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
        <div className={`copy-status-icon ${copyStatus === 'copied' ? 'copied' : ''}`}>
          {copyStatus === 'copied' ? <Check size={20} strokeWidth={2} /> : <Clipboard size={20} strokeWidth={2} />}
        </div>
      </div>
    </div>
  );
}
