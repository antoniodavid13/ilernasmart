import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const SUBJECT_COLORS = [
  '#ef5350', '#ff7043', '#66bb6a', '#ab47bc',
  '#26a69a', '#42a5f5', '#ec407a', '#ffca28',
];

export function ThemeProvider({ children }) {
  const [accentColor, setAccentColor] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const setSubjectColor = (index) => {
    const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
    setAccentColor(color);
    document.documentElement.style.setProperty('--color-accent', color);
  };

  const resetColor = () => {
    setAccentColor(null);
    document.documentElement.style.setProperty('--color-accent', 'var(--color-primary)');
  };

  const getSubjectColor = (index) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

  return (
    <ThemeContext.Provider value={{ accentColor, darkMode, toggleDarkMode, setSubjectColor, resetColor, getSubjectColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};