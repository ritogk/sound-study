import { useRef, useCallback, useEffect } from 'react';
import { PIANO_KEYS, SCALES, type KeyInfo } from './constants';

function getScaleNotes(rootIndex: number, intervals: number[]): KeyInfo[] {
  return PIANO_KEYS.filter(k => {
    const rel = (k.semitone - rootIndex + 12) % 12;
    return intervals.includes(rel);
  });
}

function pickNextNote(scaleNotes: KeyInfo[], prevIdx: number): number {
  const len = scaleNotes.length;
  if (len <= 1) return 0;

  // Prefer stepwise motion (±1-2 steps) with occasional leaps
  const leap = Math.random() < 0.15;
  const maxStep = leap ? Math.min(5, Math.floor(len / 2)) : 2;
  const step = Math.floor(Math.random() * maxStep) + 1;
  const dir = Math.random() < 0.5 ? 1 : -1;

  let next = prevIdx + dir * step;
  // Bounce off edges
  if (next < 0) next = -next;
  if (next >= len) next = 2 * (len - 1) - next;
  next = Math.max(0, Math.min(len - 1, next));

  return next;
}

function pickDuration(bpm: number): number {
  const beat = 60 / bpm;
  const durations = [beat * 0.5, beat, beat, beat, beat * 1.5, beat * 2];
  return durations[Math.floor(Math.random() * durations.length)];
}

export function useAutoPlay(
  noteOn: (note: string) => void,
  noteOff: (note: string) => void,
  setPressedNotes: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);
  const currentNoteRef = useRef<string | null>(null);
  const noteIdxRef = useRef(0);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (currentNoteRef.current) {
      const note = currentNoteRef.current;
      noteOff(note);
      setPressedNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      currentNoteRef.current = null;
    }
  }, [noteOff, setPressedNotes]);

  const start = useCallback((scaleKey: string, rootIndex: number, bpm: number) => {
    stop();
    playingRef.current = true;

    const scale = SCALES[scaleKey];
    const scaleNotes = getScaleNotes(rootIndex, scale.intervals);
    if (scaleNotes.length === 0) return;

    noteIdxRef.current = Math.floor(scaleNotes.length / 2);

    const playNext = () => {
      if (!playingRef.current) return;

      if (currentNoteRef.current) {
        const prev = currentNoteRef.current;
        noteOff(prev);
        setPressedNotes(p => {
          const n = new Set(p);
          n.delete(prev);
          return n;
        });
      }

      // Occasional rest
      if (Math.random() < 0.1) {
        currentNoteRef.current = null;
        const restDur = (60 / bpm) * (Math.random() < 0.5 ? 0.5 : 1);
        timerRef.current = setTimeout(playNext, restDur * 1000);
        return;
      }

      noteIdxRef.current = pickNextNote(scaleNotes, noteIdxRef.current);
      const key = scaleNotes[noteIdxRef.current];
      currentNoteRef.current = key.note;

      noteOn(key.note);
      setPressedNotes(p => new Set(p).add(key.note));

      const dur = pickDuration(bpm);
      timerRef.current = setTimeout(playNext, dur * 1000);
    };

    playNext();
  }, [noteOn, noteOff, setPressedNotes, stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { start, stop };
}
