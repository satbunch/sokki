import { useState } from 'react';
import { useStore } from '../store';

interface QuickSettingsProps {
  onClose?: () => void;
}

export function QuickSettings({ onClose }: QuickSettingsProps) {
  const { settings } = useStore();
  const setMaxTabs = useStore((state) => state.setMaxTabs);
  const [maxTabs, setMaxTabsLocal] = useState(settings.maxTabs);

  const handleSave = () => {
    setMaxTabs(maxTabs);
    onClose?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setMaxTabsLocal(value);
    }
  };

  return (
    <div className="quick-settings">
      <div className="quick-settings-content">
        <h2 className="quick-settings-title">Quick Settings</h2>

        <div className="settings-item">
          <label htmlFor="max-tabs-input">Maximum Tabs:</label>
          <input
            id="max-tabs-input"
            type="number"
            min="3"
            max="30"
            value={maxTabs}
            onChange={handleChange}
            className="settings-input"
          />
          <span className="settings-hint">(3 to 30)</span>
        </div>

        <div className="settings-actions">
          <button
            onClick={handleSave}
            className="settings-button settings-button-primary"
          >
            Save
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="settings-button settings-button-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
