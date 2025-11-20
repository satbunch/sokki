import { useEffect, useState } from 'react';
import { useStore } from '../services/store';
import { useTheme } from '../theme/ThemeContext';
import { extractShortcutKey, formatShortcut, isValidShortcut } from '../utils/shortcut';
import { updateGlobalShortcut, setGlobalShortcutEnabled } from '../lib/commands/tauri-commands';

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { settings } = useStore();
  const setMaxTabs = useStore((state) => state.setMaxTabs);
  const setOpacity = useStore((state) => state.setOpacity);
  const setShortcuts = useStore((state) => state.setShortcuts);
  const { preference, setPreference } = useTheme();
  const [maxTabs, setMaxTabsLocal] = useState(settings.maxTabs);
  const [opacity, setOpacityLocal] = useState(settings.opacity);
  const [themePreference, setThemePreferenceLocal] = useState(preference);
  const [globalShortcut, setGlobalShortcutLocal] = useState(settings.shortcuts.globalShow);
  const [isListening, setIsListening] = useState(false);
  const [shortcutCaptured, setShortcutCaptured] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  // Disable global shortcut when settings opens, re-enable when closes
  useEffect(() => {
    setGlobalShortcutEnabled(false);

    return () => {
      setGlobalShortcutEnabled(true);
    };
  }, []);

  // Close settings when Esc key is pressed (if not listening for shortcut)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // If listening for shortcut, handle key capture
      if (isListening) {
        e.preventDefault();
        e.stopPropagation();
        if (isValidShortcut(e)) {
          const newShortcut = extractShortcutKey(e);
          setGlobalShortcutLocal(newShortcut);
          setShortcutCaptured(true);
          setIsListening(false);
        }
        return;
      }

      // Normal Esc handling - close settings, don't hide window
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeydown, true);
    return () => window.removeEventListener('keydown', handleKeydown, true);
  }, [onClose, isListening]);

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

  const handleShortcutDisplayClick = () => {
    setIsListening(true);
  };

  const handleChangeButtonClick = async () => {
    // Apply the captured shortcut
    try {
      await updateGlobalShortcut(globalShortcut);
      // Update store after successful backend update
      setShortcuts({
        ...settings.shortcuts,
        globalShow: globalShortcut,
      });
      // Show success feedback
      setChangeSuccess(true);
      setShortcutCaptured(false);
      // Hide feedback after 2 seconds
      setTimeout(() => setChangeSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update global shortcut:', error);
      // Reset to previous shortcut if update fails
      setGlobalShortcutLocal(settings.shortcuts.globalShow);
      setShortcutCaptured(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-[2000]"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div
        className="rounded-xl flex overflow-hidden"
        style={{
          background: 'var(--bg-editor)',
          boxShadow: '0 20px 60px var(--shadow-lg)',
          width: '700px',
          height: '450px'
        }}
      >
        {/* Sidebar Navigation */}
        <div
          className="w-40 py-4 overflow-y-auto"
          style={{
            borderRight: '0.5px solid var(--border-light)'
          }}
        >
          <div
            className="px-4 py-3 cursor-pointer transition-all duration-150 text-[13px] font-medium pl-3.5"
            style={{
              background: 'var(--overlay-hover)',
              color: 'var(--text-primary)',
              borderLeft: '2px solid var(--color-primary)'
            }}
          >
            General
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Breadcrumb and Close Button */}
          <div
            className="px-6 py-4 flex-shrink-0"
            style={{
              borderBottom: '0.5px solid var(--border-light)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Settings <span className="mx-1.5" style={{ color: 'var(--text-quaternary)' }}>/</span> General
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-transparent border-0 text-lg cursor-pointer px-2 py-1 flex items-center justify-center transition-all duration-150 rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--overlay-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.background = 'var(--overlay-active)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.background = 'var(--overlay-hover)';
                  }}
                  aria-label="Close settings"
                >
                  ✕
                </button>
              )}
            </div>
            <h2 className="text-base font-semibold m-0" style={{ color: 'var(--text-primary)' }}>General</h2>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="max-tabs-input" className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Maximum Tabs:</label>
              <input
                id="max-tabs-input"
                type="number"
                min="3"
                max="30"
                value={maxTabs}
                onChange={handleMaxTabsLocalChange}
                className="px-3 py-2 rounded-md text-[13px] bg-transparent outline-none transition-all duration-150"
                style={{
                  border: '0.5px solid var(--border-light)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--focus-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <span className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>(3 to 30)</span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="opacity-slider" className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Window Opacity:</label>
              <div className="flex items-center gap-2">
                <input
                  id="opacity-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="flex-1 h-1 rounded outline-none appearance-none cursor-pointer settings-slider"
                  style={{
                    background: 'linear-gradient(90deg, var(--overlay-disabled), var(--overlay-active))'
                  }}
                />
                <input
                  id="opacity-input"
                  type="number"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                  className="w-[70px] px-2 py-1.5 text-center text-[13px] px-3 py-2 rounded-md bg-transparent outline-none transition-all duration-150"
                  style={{
                    border: '0.5px solid var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--focus-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Theme:</label>
              <div className="flex flex-col gap-1.5">
                {(['light', 'dark', 'system'] as const).map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded transition-all duration-150"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--overlay-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <input
                      type="radio"
                      name="theme"
                      checked={themePreference === opt}
                      onChange={() => handleThemeChange(opt)}
                      className="cursor-pointer"
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                      {opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'System'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Global Shortcut:</label>
              <div className="flex gap-2 items-center">
                <div
                  className="flex-1 px-3 py-2 rounded-md text-[13px] bg-transparent min-h-8 flex items-center transition-all duration-150"
                  onClick={handleShortcutDisplayClick}
                  style={{
                    border: '0.5px solid var(--border-light)',
                    cursor: isListening ? 'default' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isListening) {
                      e.currentTarget.style.background = 'var(--overlay-subtle)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  {isListening ? (
                    <span className="font-medium shortcut-listening" style={{ color: 'var(--color-primary)' }}>Listening...</span>
                  ) : (
                    <span className="font-medium font-mono" style={{ color: 'var(--text-primary)' }}>{formatShortcut(globalShortcut)}</span>
                  )}
                </div>
                <button
                  onClick={handleChangeButtonClick}
                  className="px-4 py-1.5 border-0 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 outline-none"
                  disabled={isListening || !shortcutCaptured}
                  style={{
                    background: changeSuccess ? 'var(--color-success)' : 'var(--overlay-button-bg)',
                    color: changeSuccess ? 'white' : 'var(--text-secondary)',
                    boxShadow: changeSuccess ? '0 1px 3px var(--shadow-success-sm)' : 'none',
                    opacity: isListening || !shortcutCaptured ? 0.5 : 1,
                    cursor: isListening || !shortcutCaptured ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled && !changeSuccess) {
                      e.currentTarget.style.background = 'var(--overlay-active)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!changeSuccess) {
                      e.currentTarget.style.background = 'var(--overlay-button-bg)';
                    }
                  }}
                >
                  {changeSuccess ? '✓ Applied' : 'Change'}
                </button>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>
                {isListening
                  ? 'Press any key combination with a modifier key + another key (e.g., Cmd+Shift+K)'
                  : 'Click to record a new shortcut, then press Change to apply'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
