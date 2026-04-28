import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  sidebar: string;
}

export interface ThemeSettings {
  palette: string;
  mode: 'light' | 'dark';
  radius: 'none' | 'small' | 'medium' | 'large' | 'full';
  density: 'compact' | 'comfortable' | 'spacious';
}

export const palettes: Record<string, ThemeColors> = {
  original: {
    primary: '#4E605D',
    primaryHover: '#3E4E4B',
    sidebar: '#0F0F0F',
  },
  indigo: {
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    sidebar: '#1E1B4B',
  },
  cobalt: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    sidebar: '#0F172A',
  },
  emerald: {
    primary: '#10B981',
    primaryHover: '#059669',
    sidebar: '#064E3B',
  },
  rose: {
    primary: '#E11D48',
    primaryHover: '#BE123C',
    sidebar: '#4C0519',
  },
  amber: {
    primary: '#D97706',
    primaryHover: '#B45309',
    sidebar: '#451A03',
  },
  slate: {
    primary: '#475569',
    primaryHover: '#334155',
    sidebar: '#0F172A',
  },
  violet: {
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    sidebar: '#2E1065',
  },
};

const radiusMap = {
  none: '0px',
  small: '0.375rem',
  medium: '0.75rem',
  large: '1.5rem',
  full: '9999px',
};

const densityMap = {
  compact: '0.75',
  comfortable: '1',
  spacious: '1.25',
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('app-theme-settings');
    return saved ? JSON.parse(saved) : {
      palette: 'original',
      mode: 'light',
      radius: 'large',
      density: 'comfortable',
    };
  });

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    localStorage.setItem('app-theme-settings', JSON.stringify(settings));
    const palette = palettes[settings.palette] || palettes.original;
    
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', palette.primary);
    root.style.setProperty('--theme-primary-hover', palette.primaryHover);
    
    if (settings.mode === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--theme-bg', '#0A0A0A');
      root.style.setProperty('--theme-text', '#FFFFFF');
      root.style.setProperty('--theme-sidebar', '#000000');
      root.style.setProperty('--theme-border', '#1A1A1A');
      root.style.setProperty('--theme-card-bg', '#121212');
      root.style.setProperty('--theme-muted', '#888888');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--theme-bg', '#FFFFFF');
      root.style.setProperty('--theme-text', '#1A1A1A');
      root.style.setProperty('--theme-sidebar', palette.sidebar);
      root.style.setProperty('--theme-border', '#F0F0F0');
      root.style.setProperty('--theme-card-bg', '#FFFFFF');
      root.style.setProperty('--theme-muted', '#666666');
    }
    
    root.style.setProperty('--theme-radius', radiusMap[settings.radius]);
    root.style.setProperty('--theme-density-scale', densityMap[settings.density]);
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
