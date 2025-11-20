import { Note } from '../types/index';
import { previewTooltip } from '../utils/previewTooltip';
import { Feather } from 'lucide-react';

interface TabItemProps {
  note: Note;
  isActive: boolean;
  onClick: (id: string) => void;
  onContextMenu: (id: string) => void;
}

export function TabItem({
  note,
  isActive,
  onClick,
  onContextMenu,
}: TabItemProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(note.id);
  };

  const tooltipText = previewTooltip(note.content);

  return (
    <button
      className={`relative flex items-center justify-start gap-1.5 w-full h-4/5 border-0 cursor-pointer px-2.5 pb-3 pt-0 transition-all duration-150 outline-none mx-0.5 text-[13px] whitespace-nowrap text-ellipsis tab-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(note.id)}
      onContextMenu={handleContextMenu}
      data-tooltip={tooltipText}
      aria-label={`Note tab: ${tooltipText}`}
      style={{
        borderRadius: '0 0 12px 12px',
        background: isActive ? 'var(--bg-editor)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
        position: 'relative',
        zIndex: isActive ? 1001 : 'auto'
      }}
    >
      <Feather size={12} strokeWidth={2} />
    </button>
  );
}
