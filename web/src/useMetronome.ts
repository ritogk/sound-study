import { useRef, useCallback, useEffect, useState } from 'react';
import { startMetronome, stopMetronome } from './audioEngine';

export function useMetronome() {
  const [beat, setBeat] = useState(-1);
  const playingRef = useRef(false);

  const stop = useCallback(() => {
    playingRef.current = false;
    stopMetronome();
    setBeat(-1);
  }, []);

  const start = useCallback((bpm: number) => {
    stop();
    playingRef.current = true;
    startMetronome(bpm, (b) => {
      if (playingRef.current) setBeat(b);
    });
  }, [stop]);

  useEffect(() => {
    return () => { stopMetronome(); };
  }, []);

  return { start, stop, beat };
}
