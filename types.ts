export type StatKey = 'STR' | 'DEX' | 'INT' | 'CHA' | 'VIT';

export interface Stats {
  STR: number;
  DEX: number;
  INT: number;
  CHA: number;
  VIT: number;
}

export interface Skill {
  name: string;
  description: string;
  type: 'Active' | 'Passive';
  statScale: StatKey;
}

export interface Character {
  name: string;
  race: string;
  classType: string;
  background: string;
  alignment: string;
  stats: Stats;
  skills: Skill[];
  backstory: string;
  portraitUrl: string; // Base64 or URL
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
}

export interface GameState {
  sceneDescription: string;
  sceneImageUrl: string;
  choices: string[];
  history: { role: 'user' | 'model'; text: string }[];
  turnCount: number;
  isLoading: boolean;
}

export interface GameEvent {
  description: string;
  newChoices: string[];
}