'use client';

import { useEffect, useState } from 'react';

// List of available DaisyUI themes with emojis
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
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setSelectedTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update the theme attribute on the html element
      document.documentElement.setAttribute('data-theme', selectedTheme);
      // Save the selected theme to localStorage
      localStorage.setItem('theme', selectedTheme);
    }
  }, [selectedTheme, mounted]);

  return (
    <div className="form-control">
      <select 
        className="select select-bordered max-w-xs"
        value={selectedTheme}
        onChange={(e) => setSelectedTheme(e.target.value)}
        aria-label="Select theme"
      >
        {THEMES.map((theme) => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}