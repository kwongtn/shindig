'use client';

import { useEffect, useState } from 'react';

// List of available DaisyUI themes with emojis (excluding system theme)
const THEMES = [
  { value: 'light', label: '⚪ Light' },
  { value: 'dark', label: '⚫ Dark' },
  { value: 'cupcake', label: '🧁 Cupcake' },
  { value: 'bumblebee', label: '🐝 Bumblebee' },
  { value: 'emerald', label: '💚 Emerald' },
  { value: 'corporate', label: '👔 Corporate' },
  { value: 'synthwave', label: '🎹 Synthwave' },
  { value: 'retro', label: '📺 Retro' },
  { value: 'cyberpunk', label: '🤖 Cyberpunk' },
  { value: 'valentine', label: '💕 Valentine' },
  { value: 'halloween', label: '🎃 Halloween' },
  { value: 'garden', label: '🌻 Garden' },
  { value: 'forest', label: '🌲 Forest' },
  { value: 'aqua', label: '💧 Aqua' },
  { value: 'lofi', label: '📱 Lofi' },
  { value: 'pastel', label: '🎨 Pastel' },
  { value: 'fantasy', label: '🧚 Fantasy' },
  { value: 'wireframe', label: '📐 Wireframe' },
  { value: 'black', label: '🖤 Black' },
  { value: 'luxury', label: '💎 Luxury' },
  { value: 'dracula', label: '🧛 Dracula' },
  { value: 'cmyk', label: '🌈 Cmyk' },
  { value: 'autumn', label: '🍂 Autumn' },
  { value: 'business', label: '💼 Business' },
  { value: 'acid', label: '🧪 Acid' },
  { value: 'lemonade', label: '🍋 Lemonade' },
  { value: 'night', label: '🌃 Night' },
  { value: 'coffee', label: '☕ Coffee' },
  { value: 'winter', label: '❄️ Winter' },
];

export default function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('theme') || 'system';
    setSelectedTheme(savedTheme);

    // Apply system theme by default
    if (savedTheme === 'system') {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      if (selectedTheme === 'system') {
        // Apply system theme based on user's OS preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        // Update the theme attribute on the html element
        document.documentElement.setAttribute('data-theme', selectedTheme);
      }
      // Save the selected theme to localStorage
      localStorage.setItem('theme', selectedTheme);
    }
  }, [selectedTheme, mounted]);

  // Listen for changes in system preference
  useEffect(() => {
    if (selectedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [selectedTheme]);

  return (
    <div className="form-control">
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1 select select-bordered max-w-xs">
          {selectedTheme === 'system' ? '🖥️ System' : THEMES.find(t => t.value === selectedTheme)?.label || 'Theme'}
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
          <li>
            <button
              onClick={() => setSelectedTheme('system')}
              className={selectedTheme === 'system' ? 'active' : ''}
            >
              🖥️ System
            </button>
          </li>
          <li className="divider" style={{ "height": "1px", "margin": "5px 0px" }}></li>
          {THEMES.map((theme) => (
            <li key={theme.value}>
              <button
                onClick={() => setSelectedTheme(theme.value)}
                className={selectedTheme === theme.value ? 'active' : ''}
              >
                {theme.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div >
  );
}
