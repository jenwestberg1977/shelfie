export type TierId = string;

export type BookFormat = 'Audiobook' | 'Physical Book' | 'E-reader';

export interface ReadingSession {
  id: string;
  startDate: string;
  endDate: string;
  format: BookFormat;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  tier: TierId;
  sessions: ReadingSession[];
  comments: string;
  dnfProgress: number; // 0-100
  tags: string[];
  pages: number; // Number of pages in the book
}

export interface TierDefinition {
  id: TierId;
  label: string;
  color: string;
}

export interface ThemeColors {
  [key: string]: string; // Support dynamic tier IDs
  background: string;
  accent: string;
  text: string;
}

export type ThemePreset = 'Botanical Garden' | 'Midnight Galaxy' | 'Pastel Dream' | 'Custom';