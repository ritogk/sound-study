import { useRef, useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';

export function useMetronome() {
  const [beat, setBeat] = useState(-1);
  const clickRef = useRef<Tone.MembraneSynth | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const playingRef = useRef(false);

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
    if (schedulerRef.current !== null) {
      Tone.getTransport().clear(schedulerRef.current);
      schedulerRef.current = null;
    }
    Tone.getTransport().stop();
    setBeat(-1);
  }, []);

  const start = useCallback((bpm: number) => {
    stop();
    playingRef.current = true;

    const click = getClick();
    const transport = Tone.getTransport();
    transport.bpm.value = bpm;
    transport.position = 0;

    let beatCount = 0;
    schedulerRef.current = transport.scheduleRepeat((time) => {
      if (!playingRef.current) return;
      const isDownbeat = beatCount % 4 === 0;
      click.triggerAttackRelease(isDownbeat ? 'C2' : 'C3', '32n', time);
      const b = beatCount % 4;
      beatCount++;
      Tone.getDraw().schedule(() => setBeat(b), time);
    }, '4n');

    transport.start();
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
