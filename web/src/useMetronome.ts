import { useRef, useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';

export function useMetronome() {
  const [beat, setBeat] = useState(-1);
  const clickRef = useRef<Tone.MembraneSynth | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef = useRef(false);
  const beatRef = useRef(0);

  const getClick = useCallback(() => {
    if (!clickRef.current) {
      clickRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
        volume: -4,
      }).toDestination();
    }
    return clickRef.current;
  }, []);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setBeat(-1);
    beatRef.current = 0;
  }, []);

  const start = useCallback((bpm: number) => {
    stop();
    playingRef.current = true;
    beatRef.current = 0;

    const click = getClick();
    const interval = (60 / bpm) * 1000;

    const tick = () => {
      if (!playingRef.current) return;
      const isDownbeat = beatRef.current % 4 === 0;
      click.triggerAttackRelease(isDownbeat ? 'C2' : 'C3', '32n', Tone.now());
      setBeat(beatRef.current % 4);
      beatRef.current++;
    };

    tick();
    timerRef.current = setInterval(tick, interval);
  }, [stop, getClick]);

  useEffect(() => {
    return () => {
      stop();
      clickRef.current?.dispose();
      clickRef.current = null;
    };
  }, [stop]);

  return { start, stop, beat };
}
