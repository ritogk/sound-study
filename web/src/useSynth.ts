import { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

let globalSynth: Tone.PolySynth | null = null;

export async function initAudio() {
  Tone.setContext(new Tone.Context({ latencyHint: 'interactive', lookAhead: 0.01 }));
  await Tone.start();
  await Tone.getContext().rawContext.resume();

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.6 },
    volume: -8,
  }).toDestination();
  synth.maxPolyphony = 16;
  globalSynth = synth;

  // Warm up: play a silent note to prime the audio graph
  synth.triggerAttackRelease('C3', '32n', Tone.now(), 0);
}

export function useSynth() {
  const disposedRef = useRef(false);

  const noteOn = useCallback((note: string) => {
    if (!disposedRef.current && globalSynth) {
      globalSynth.triggerAttack(note, Tone.now());
    }
  }, []);

  const noteOff = useCallback((note: string) => {
    globalSynth?.triggerRelease(note, Tone.now());
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    return () => { disposedRef.current = true; };
  }, []);

  return { noteOn, noteOff };
}
