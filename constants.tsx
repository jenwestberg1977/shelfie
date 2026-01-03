import { TierDefinition, ThemeColors, ThemePreset } from './types';

export const DEFAULT_TIERS: TierDefinition[] = [
  { id: 'TBR', label: 'TBR', color: '#A3B18A' },
  { id: 'GOD', label: 'God Tier', color: '#E5989B' },
  { id: 'A', label: 'A Tier', color: '#344E41' },
  { id: 'B', label: 'B Tier', color: '#6D597A' },
  { id: 'C', label: 'C Tier', color: '#B56576' },
  { id: 'DNF', label: 'DNF', color: '#582F0E' },
];

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  'Botanical Garden': {
    TBR: '#A3B18A',
    GOD: '#E5989B',
    A: '#344E41',
    B: '#6D597A',
    C: '#B56576',
    DNF: '#582F0E',
    background: '#F1F3EE',
    accent: '#3A5A40',
    text: '#1B2E1D',
  },
  'Midnight Galaxy': {
    TBR: '#1B263B',
    GOD: '#E01E37',
    A: '#7209B7',
    B: '#4361EE',
    C: '#4A4E69',
    DNF: '#0B090A',
    background: '#0D1117',
    accent: '#4CC9F0',
    text: '#F8F9FA',
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