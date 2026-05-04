import { useCallback } from 'react';
import { noteOn, noteOff } from './audioEngine';

export { initAudio } from './audioEngine';

export function useSynth() {
  const on = useCallback((note: string) => noteOn(note), []);
  const off = useCallback((note: string) => noteOff(note), []);
  return { noteOn: on, noteOff: off };
}
