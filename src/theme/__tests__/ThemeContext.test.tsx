import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component
const TestComponent = () => {
  const { mode, preference, setPreference } = useTheme();
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="preference">{preference}</div>
      <button
        data-testid="set-light"
        onClick={() => setPreference('light')}
      >
        Light
      </button>
      <button
        data-testid="set-dark"
        onClick={() => setPreference('dark')}
      >
        Dark
      </button>
      <button
        data-testid="set-system"
        onClick={() => setPreference('system')}
      >
        System
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should initialize with system preference by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('should set data-theme attribute on document root', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const dataTheme = document.documentElement.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(dataTheme);
  });

  it('should persist preference to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const lightButton = screen.getByTestId('set-light');
    lightButton.click();

    expect(localStorage.getItem('sokki.themePreference')).toBe('light');
  });

  it('should apply theme preference from localStorage on mount', () => {
    localStorage.setItem('sokki.themePreference', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('preference')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should update data-theme when preference changes', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const darkButton = screen.getByTestId('set-dark');
    darkButton.click();

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
