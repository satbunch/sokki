import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';

export const ThemeMenu: React.FC = () => {
  const { preference, mode, setPreference } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="button theme-toggle-button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme selector"
        title="Theme"
      >
        🌓
      </button>
      {open && (
        <div
          className="theme-menu-dropdown"
          style={{
            position: 'absolute',
            right: 0,
            bottom: '110%',
            background: 'var(--button-bg)',
            border: `1px solid var(--button-border)`,
            borderRadius: 10,
            padding: 8,
            minWidth: 160,
            zIndex: 1001,
          }}
        >
          {(['light', 'dark', 'system'] as const).map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                cursor: 'pointer',
                borderRadius: 6,
                transition: 'background 120ms ease',
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--button-hover-bg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <input
                type="radio"
                id={`theme-${opt}`}
                name="theme"
                checked={preference === opt}
                onChange={() => {
                  setPreference(opt);
                  setOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-color)', flex: 1 }}>
                {opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'System'}
              </span>
              {opt !== 'system' && preference === opt && (
                <span className="accent" style={{ fontSize: 12, fontWeight: 'bold' }}>
                  {mode.toUpperCase()}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
