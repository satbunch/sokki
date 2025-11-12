import { Note } from '../types';
import { previewTooltip } from '../utils/previewTooltip';

interface TabItemProps {
  note: Note;
  isActive: boolean;
  onClick: (id: string) => void;
  onContextMenu: (id: string) => void;
}

export function TabItem({ note, isActive, onClick, onContextMenu }: TabItemProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(note.id);
  };

  const tooltipText = previewTooltip(note.content);

  return (
    <button
      className={`tab-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(note.id)}
      onContextMenu={handleContextMenu}
      data-tooltip={tooltipText}
      aria-label={`Note tab: ${tooltipText}`}
    />
  );
}
