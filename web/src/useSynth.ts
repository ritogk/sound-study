import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

let globalStarted = false;
let globalSynth: Tone.PolySynth | null = null;

async function ensureAudioStarted() {
  if (!globalStarted) {
    await Tone.start();
    await Tone.getContext().rawContext.resume();
    globalStarted = true;
  }
  if (!globalSynth) {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
      volume: -8,
    }).toDestination();
    synth.maxPolyphony = 16;
    globalSynth = synth;
  }
}

export function useSynth() {
  const disposedRef = useRef(false);

  const noteOn = useCallback(async (note: string) => {
    await ensureAudioStarted();
    if (!disposedRef.current) {
      globalSynth?.triggerAttack(note, Tone.now());
    }
  }, []);

  const noteOff = useCallback((note: string) => {
    globalSynth?.triggerRelease(note, Tone.now());
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    return () => { disposedRef.current = true; };
  }, []);

  return { noteOn, noteOff, ensureAudio: ensureAudioStarted };
}
