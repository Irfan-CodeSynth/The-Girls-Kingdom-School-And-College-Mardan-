import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Always default to 'light' to match the official client white theme
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    // If user had previously toggled dark, reset to light to match client's white requirement
    if (saved === 'dark') {
      localStorage.setItem('theme', 'light');
      return 'light';
    }
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Ensure dark class is removed so the clean white theme is always displayed
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
