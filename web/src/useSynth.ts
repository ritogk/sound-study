import { useCallback } from 'react';
import * as Tone from 'tone';

let globalSynth: Tone.PolySynth | null = null;
let initialized = false;

export async function initAudio() {
  if (initialized) return;
  initialized = true;

  await Tone.start();

  Tone.getContext().lookAhead = 0.01;

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.6 },
    volume: -8,
  }).toDestination();
  synth.maxPolyphony = 16;
  globalSynth = synth;

  synth.triggerAttackRelease('C3', '32n', Tone.now(), 0);
}

export function useSynth() {
  const noteOn = useCallback((note: string) => {
    globalSynth?.triggerAttack(note, Tone.now());
  }, []);

  const noteOff = useCallback((note: string) => {
    globalSynth?.triggerRelease(note, Tone.now());
  }, []);

  return { noteOn, noteOff };
}
