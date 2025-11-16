import { useEffect, useState } from 'react';
import { useStore } from '../services/store';
import { useTheme } from '../theme/ThemeContext';

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { settings } = useStore();
  const setMaxTabs = useStore((state) => state.setMaxTabs);
  const setOpacity = useStore((state) => state.setOpacity);
  const { preference, setPreference } = useTheme();
  const [maxTabs, setMaxTabsLocal] = useState(settings.maxTabs);
  const [opacity, setOpacityLocal] = useState(settings.opacity);
  const [themePreference, setThemePreferenceLocal] = useState(preference);


  // Close settings when Esc key is pressed
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onClose]);

  const handleOpacityChange = (value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setOpacityLocal(clamped);
    // Apply opacity change immediately
    setOpacity(clamped);
  };

  const handleThemeChange = (theme: typeof themePreference) => {
    setThemePreferenceLocal(theme);
    setPreference(theme);
  };

  const handleMaxTabsLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setMaxTabsLocal(value);
      setMaxTabs(value);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-content">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <div className="settings-nav-item active">General</div>
        </div>

        {/* Main Content Area */}
        <div className="settings-main">
          {/* Header with Breadcrumb and Close Button */}
          <div className="settings-main-header">
            <div className="settings-header-top">
              <div className="settings-breadcrumb">
                Settings <span className="breadcrumb-separator">/</span> General
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="settings-close-button"
                  aria-label="Close settings"
                >
                  ✕
                </button>
              )}
            </div>
            <h2 className="settings-header">General</h2>
          </div>

          {/* Settings Content */}
          <div className="settings-scrollable-content">
            <div className="settings-item">
              <label htmlFor="max-tabs-input">Maximum Tabs:</label>
              <input
                id="max-tabs-input"
                type="number"
                min="3"
                max="30"
                value={maxTabs}
                onChange={handleMaxTabsLocalChange}
                className="settings-input"
              />
              <span className="settings-hint">(3 to 30)</span>
            </div>

            <div className="settings-item">
              <label htmlFor="opacity-slider">Window Opacity:</label>
              <div className="opacity-control">
                <input
                  id="opacity-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="settings-slider"
                />
                <input
                  id="opacity-input"
                  type="number"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="settings-input opacity-input"
                />
                <span className="opacity-unit">%</span>
              </div>
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
                      onChange={() => handleThemeChange(opt)}
                    />
                    <span>
                      {opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'System'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
