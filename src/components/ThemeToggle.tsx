import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTheme } from '../contexts/ThemeContext';



const ThemeToggle = ({gap='20px', showCurrentTheme=false}) => {
  const { theme, toggleTheme } = useTheme();
 

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('Slipi-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('Slipi-theme', 'light');
    }
  }, [theme]);

  return (
    <div style={{gap}} className="relative flex">
      <div 
        title='תצוגה בהירה'
        style={{...(theme === 'dark' && {opacity: 0.5}), display: showCurrentTheme ? theme === 'dark' ? 'none' : 'block' : 'block'}}
        onClick={() => toggleTheme()}
        className="p-3 rounded-full  cursor-pointer bg-white/50 dark:bg-black/50 backdrop-blur-md text-text-light dark:text-text-dark shadow-lg hover:scale-110 transition-transform duration-200 ease-in-out"
      >
        <Icon icon="ix:light-dark" className="w-5 h-5" />
      </div>
      <div 
        title='תצוגה כהה'
        style={{...(theme === 'dark' && {opacity: 1}), display: showCurrentTheme ? theme === 'dark' ? 'block' : 'none' : 'block'}}
        onClick={() => toggleTheme()}
        className="p-3 rounded-full cursor-pointer bg-white/50 dark:bg-black/50 backdrop-blur-md  text-text-light dark:text-text-dark shadow-lg hover:scale-110 transition-transform duration-200 ease-in-out"
      >
        <Icon icon="circum:dark" className="w-5 h-5" />
      </div>
    </div>
  );
};

export default ThemeToggle; 