import { useRef, useCallback, useEffect, useState } from 'react';

let Tone: typeof import('tone') | null = null;

async function getTone() {
  if (!Tone) Tone = await import('tone');
  return Tone;
}

export function useMetronome() {
  const [beat, setBeat] = useState(-1);
  const clickRef = useRef<import('tone').MembraneSynth | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const playingRef = useRef(false);

  const getClick = useCallback(async () => {
    const T = await getTone();
    if (!clickRef.current) {
      clickRef.current = new T.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
        volume: -4,
      }).toDestination();
    }
    return clickRef.current;
  }, []);

  const stop = useCallback(async () => {
    playingRef.current = false;
    const T = await getTone();
    if (schedulerRef.current !== null) {
      T.getTransport().clear(schedulerRef.current);
      schedulerRef.current = null;
    }
    T.getTransport().stop();
    setBeat(-1);
  }, []);

  const start = useCallback(async (bpm: number) => {
    await stop();
    playingRef.current = true;

    const T = await getTone();
    const click = await getClick();
    const transport = T.getTransport();
    transport.bpm.value = bpm;
    transport.position = 0;

    let beatCount = 0;
    schedulerRef.current = transport.scheduleRepeat((time) => {
      if (!playingRef.current) return;
      const isDownbeat = beatCount % 4 === 0;
      click.triggerAttackRelease(isDownbeat ? 'C2' : 'C3', '32n', time);
      const b = beatCount % 4;
      beatCount++;
      T.getDraw().schedule(() => setBeat(b), time);
    }, '4n');

    transport.start();
  }, [stop, getClick]);

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (Tone && schedulerRef.current !== null) {
        Tone.getTransport().clear(schedulerRef.current);
        Tone.getTransport().stop();
      }
      clickRef.current?.dispose();
      clickRef.current = null;
    };
  }, []);

  return { start, stop, beat };
}
