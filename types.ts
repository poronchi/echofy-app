
export interface Word {
  original: string;
  id: string;
  errors: number;
  successes: number; // Nuevo campo para aciertos
  completed: boolean;
}

export interface WordList {
  id: string;
  name: string;
  words: Word[];
  themeIndex: number;
  lastPlayed?: number;
  settings: {
    rainEnabled: boolean;
  };
}

export type AppRole = 'parent' | 'child';

export interface GameSession {
  listId: string;
  words: Word[];
  mode: 'normal' | 'repaso';
}

export interface VoiceSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}
