export const NOTE_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_JA = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ファ', 'ファ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'] as const;

export const SCALES: Record<string, { name: string; intervals: number[]; color: string }> = {
  major:          { name: 'メジャー',             intervals: [0,2,4,5,7,9,11],    color: '#4F8EF7' },
  minor:          { name: 'マイナー',             intervals: [0,2,3,5,7,8,10],    color: '#A855F7' },
  pentatonic:     { name: 'ペンタトニック',       intervals: [0,2,4,7,9],         color: '#F59E0B' },
  blues:          { name: 'ブルース',             intervals: [0,3,5,6,7,10],      color: '#3B82F6' },
  dorian:         { name: 'ドリアン',             intervals: [0,2,3,5,7,9,10],    color: '#10B981' },
  phrygian:       { name: 'フリジアン',           intervals: [0,1,3,5,7,8,10],    color: '#EF4444' },
  lydian:         { name: 'リディアン',           intervals: [0,2,4,6,7,9,11],    color: '#EC4899' },
  harmonicMinor:  { name: 'ハーモニックマイナー', intervals: [0,2,3,5,7,8,11],    color: '#8B5CF6' },
};

export const ROOT_NOTES = NOTE_NAMES_EN.map((name, i) => ({ name, index: i }));

export interface KeyInfo {
  note: string;       // e.g. "C3"
  midi: number;       // MIDI number
  isBlack: boolean;
  nameJa: string;
  nameEn: string;
  semitone: number;   // 0-11
}

export function buildKeys(startOctave: number, endOctave: number): KeyInfo[] {
  const keys: KeyInfo[] = [];
  for (let octave = startOctave; octave <= endOctave; octave++) {
    const limit = octave === endOctave ? 1 : 12;
    for (let i = 0; i < limit; i++) {
      const name = NOTE_NAMES_EN[i];
      keys.push({
        note: `${name}${octave}`,
        midi: octave * 12 + i + 12,
        isBlack: name.includes('#'),
        nameJa: NOTE_NAMES_JA[i],
        nameEn: name,
        semitone: i,
      });
    }
  }
  return keys;
}

export const PIANO_KEYS = buildKeys(3, 5);

export const KEY_MAP: Record<string, string> = {
  'a': 'C3', 'w': 'C#3', 's': 'D3', 'e': 'D#3', 'd': 'E3',
  'f': 'F3', 't': 'F#3', 'g': 'G3', 'y': 'G#3', 'h': 'A3',
  'u': 'A#3', 'j': 'B3',
  'k': 'C4', 'o': 'C#4', 'l': 'D4', 'p': 'D#4', ';': 'E4',
  "'": 'F4',
  'z': 'F#4', 'x': 'G4', ',': 'G#4', 'c': 'A4', '.': 'A#4', 'v': 'B4',
  'b': 'C5',
};

export const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

export function isInScale(semitone: number, rootIndex: number, intervals: number[]): boolean {
  const relative = (semitone - rootIndex + 12) % 12;
  return intervals.includes(relative);
}

export function isRoot(semitone: number, rootIndex: number): boolean {
  return semitone === rootIndex;
}
