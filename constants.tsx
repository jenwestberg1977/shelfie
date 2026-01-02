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
  'Botanical Garden': {
    TBR: '#A3B18A', // Sage Leaf
    GOD: '#E5989B', // Rose Petal
    A: '#344E41',   // Hunter Green
    B: '#6D597A',   // Lavender Twilight
    C: '#B56576',   // Dried Terracotta
    DNF: '#582F0E', // Earthy Bark
    background: '#F1F3EE', // Soft Cream
    accent: '#3A5A40',     // Forest Green
    text: '#1B2E1D',       // Dark Ivy
  },
  'Midnight Galaxy': {
    TBR: '#1B263B', // Deep Space
    GOD: '#E01E37', // Supernova
    A: '#7209B7',   // Nebula Purple
    B: '#4361EE',   // Comet Cyan
    C: '#4A4E69',   // Asteroid Grey
    DNF: '#0B090A', // Void
    background: '#0D1117', // Obsidian
    accent: '#4CC9F0',     // Starlight Blue
    text: '#F8F9FA',       // Stellar White
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