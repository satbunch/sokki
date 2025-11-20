import { useStore } from '../services/store';
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
    <div
      className="grid h-10 px-4 gap-3 m-0 z-[100] overflow-visible transition-all duration-[120ms] tab-bar"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        background: 'var(--bg-tabbar)',
        borderRadius: '0 0 0 0'
      }}
    >
      {/* Left Spacer */}
      <div className="w-6 flex-shrink-0" />

      {/* Center Tabs */}
      <div
        className="grid flex-1 min-w-0 overflow-visible"
        style={{
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
      <div className="w-6 flex items-center justify-end flex-shrink-0">
        <div
          className="flex items-center justify-center transition-all duration-150 rounded-md copy-status-icon"
          style={{
            color: copyStatus === 'copied' ? 'var(--color-success)' : 'var(--text-tertiary)',
            background: 'var(--bg-icon)',
            animation: copyStatus === 'copied' ? 'scaleIn 0.15s ease-out' : 'none'
          }}
        >
          {copyStatus === 'copied' ? <Check size={20} strokeWidth={2} /> : <Clipboard size={20} strokeWidth={2} />}
        </div>
      </div>
    </div>
  );
}
