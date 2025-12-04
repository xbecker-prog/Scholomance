import { Stats, StatKey } from './types';

export const RACES = [
  'Terran (Human)',
  'Cyber-Elf',
  'Void-Born',
  'Mecha-Construct',
  'Neko-Morph',
  'Draconian'
];

export const CLASSES = [
  'Star-Knight',
  'Warp-Mage',
  'Tech-Rogue',
  'Bio-Medic',
  'Heavy-Gunner',
  'Psionic-Operative'
];

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const BACKGROUNDS = [
  'Academy Legacy',
  'Slum Survivor',
  'Corporate Spy',
  'War Orphan',
  'Lost Royalty',
  'Memory Wiped'
];

export const BASE_STATS: Record<string, Stats> = {
  'Terran (Human)': { STR: 5, DEX: 5, INT: 5, CHA: 5, VIT: 5 },
  'Cyber-Elf': { STR: 3, DEX: 7, INT: 6, CHA: 4, VIT: 4 },
  'Void-Born': { STR: 2, DEX: 4, INT: 8, CHA: 3, VIT: 3 },
  'Mecha-Construct': { STR: 8, DEX: 3, INT: 5, CHA: 1, VIT: 8 },
  'Neko-Morph': { STR: 4, DEX: 8, INT: 3, CHA: 6, VIT: 4 },
  'Draconian': { STR: 7, DEX: 4, INT: 3, CHA: 4, VIT: 7 }
};

export const CLASS_BONUSES: Record<string, Partial<Stats>> = {
  'Star-Knight': { STR: 3, VIT: 2 },
  'Warp-Mage': { INT: 4, CHA: 1 },
  'Tech-Rogue': { DEX: 3, INT: 2 },
  'Bio-Medic': { INT: 3, VIT: 2 },
  'Heavy-Gunner': { STR: 2, VIT: 3 },
  'Psionic-Operative': { CHA: 3, INT: 2 }
};

export const calculateStats = (race: string, classType: string): Stats => {
  // Safe default matching keys
  const base = BASE_STATS[race] || { STR: 5, DEX: 5, INT: 5, CHA: 5, VIT: 5 };
  const bonus = CLASS_BONUSES[classType] || {};
  
  return {
    STR: base.STR + (bonus.STR || 0),
    DEX: base.DEX + (bonus.DEX || 0),
    INT: base.INT + (bonus.INT || 0),
    CHA: base.CHA + (bonus.CHA || 0),
    VIT: base.VIT + (bonus.VIT || 0),
  };
};