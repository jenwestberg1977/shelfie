
import { TierId, ThemeColors, ThemePreset } from './types';

export const TIERS: { id: TierId; label: string }[] = [
  { id: 'TBR', label: 'TBR' },
  { id: 'GOD', label: 'God Tier' },
  { id: 'A', label: 'A Tier' },
  { id: 'B', label: 'B Tier' },
  { id: 'C', label: 'C Tier' },
  { id: 'DNF', label: 'DNF' },
];

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  'Dark Academia': {
    TBR: '#5D4037',
    GOD: '#2C3E50',
    A: '#1B4332',
    B: '#7A6B5D',
    C: '#8D7B68',
    DNF: '#3E2723',
    background: '#FDFCF0',
    accent: '#4B3621',
    text: '#2C1B0E',
  },
  'Cyberpunk': {
    TBR: '#1a1a2e',
    GOD: '#ff0055',
    A: '#00d4ff',
    B: '#9d00ff',
    C: '#00ff9f',
    DNF: '#393e46',
    background: '#0d0221',
    accent: '#ff0055',
    text: '#ffffff',
  },
  'Pastel Dream': {
    TBR: '#B8E1FF',
    GOD: '#FFB7B2',
    A: '#FFDAC1',
    B: '#E2F0CB',
    C: '#B5EAD7',
    DNF: '#C5A3FF',
    background: '#FFF9F9',
    accent: '#FFB7B2',
    text: '#4A4A4A',
  },
  'Custom': {
    TBR: '#cbd5e1',
    GOD: '#fde047',
    A: '#86efac',
    B: '#93c5fd',
    C: '#f9a8d4',
    DNF: '#fca5a5',
    background: '#ffffff',
    accent: '#3b82f6',
    text: '#1f2937',
  },
};
