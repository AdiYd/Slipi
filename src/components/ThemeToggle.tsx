import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const ThemeToggle = ({gap='10px'}) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('Slipi-theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('Slipi-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('Slipi-theme', 'light');
    }
  }, [darkMode]);

  return (
    <div style={{gap}} className="relative flex">
      <div 
        style={{opacity: darkMode ? 0.5 : 1}}
        onClick={() => setDarkMode(false)}
        className="p-3 rounded-full bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark shadow-lg hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark cursor-pointer"
      >
        <Icon icon="ix:light-dark" className="w-5 h-5" />
      </div>
      <div 
        style={{opacity: darkMode ? 1 : 0.5}}
        onClick={() => setDarkMode(true)}
        className="p-3 rounded-full bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark shadow-lg hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark cursor-pointer"
      >
        <Icon icon="circum:dark" className="w-5 h-5" />
      </div>
    </div>
  );
};

export default ThemeToggle; 