import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.background = theme === 'dark' ? '#0f172a' : '#f8fafc';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? {
    // Dark theme colors
    background: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    hover: '#334155',
    primary: '#1ebe74',
    primaryLight: '#166534',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#10b981',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    shadow: 'rgba(0,0,0,0.3)',
  } : {
    // Light theme colors
    background: '#f8fafc',
    cardBg: '#ffffff',
    text: '#111827',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    hover: '#f1f5f9',
    primary: '#1ebe74',
    primaryLight: '#f0fdf4',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#10b981',
    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    shadow: 'rgba(0,0,0,0.05)',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
