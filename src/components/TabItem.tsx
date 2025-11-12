import { Note } from '../types';
import { previewTooltip } from '../utils/previewTooltip';
import { Tooltip } from './Tooltip';

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
    <Tooltip content={previewTooltip(note.content)}>
      <button
        className={`tab-item ${isActive ? 'active' : ''}`}
        onClick={() => onClick(note.id)}
        onContextMenu={handleContextMenu}
        aria-label={`Note tab: ${previewTooltip(note.content)}`}
      />
    </Tooltip>
  );
}
