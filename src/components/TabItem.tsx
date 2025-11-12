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

  return (
    <button
      className={`tab-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(note.id)}
      onContextMenu={handleContextMenu}
      title={previewTooltip(note.content)}
      aria-label={`Note tab: ${previewTooltip(note.content)}`}
    />
  );
}
