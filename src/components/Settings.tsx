import { useState } from 'react';
import { useStore } from '../store';
import { useTheme } from '../theme/ThemeContext';

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { settings } = useStore();
  const setMaxTabs = useStore((state) => state.setMaxTabs);
  const { preference, setPreference } = useTheme();
  const [maxTabs, setMaxTabsLocal] = useState(settings.maxTabs);
  const [themePreference, setThemePreferenceLocal] = useState(preference);

  const handleSave = () => {
    setMaxTabs(maxTabs);
    setPreference(themePreference);
    onClose?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setMaxTabsLocal(value);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-content">
        <h2 className="settings-header">Settings</h2>

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

        <div className="settings-item">
          <label>Theme:</label>
          <div className="theme-options">
            {(['light', 'dark', 'system'] as const).map((opt) => (
              <label
                key={opt}
                className="theme-option"
              >
                <input
                  type="radio"
                  name="theme"
                  checked={themePreference === opt}
                  onChange={() => setThemePreferenceLocal(opt)}
                />
                <span>
                  {opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'System'}
                </span>
              </label>
            ))}
          </div>
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
