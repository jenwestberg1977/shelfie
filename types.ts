
export type TierId = 'TBR' | 'GOD' | 'A' | 'B' | 'C' | 'DNF';

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
}

export interface ThemeColors {
  TBR: string;
  GOD: string;
  A: string;
  B: string;
  C: string;
  DNF: string;
  background: string;
  accent: string;
  text: string;
}

export type ThemePreset = 'Dark Academia' | 'Cyberpunk' | 'Pastel Dream' | 'Custom';
