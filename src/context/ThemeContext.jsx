import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [companySettings, setCompanySettings] = useState(() => {
    const saved = localStorage.getItem('companySettings');
    return saved
      ? JSON.parse(saved)
      : { name: 'Comercializadora Mi Ángel', rif: 'J-16463127-0', logo: '/logo.png' };
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
  }, [companySettings]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const updateCompanySettings = (newSettings) =>
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, companySettings, updateCompanySettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
