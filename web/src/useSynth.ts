import { useCallback, useEffect, useRef } from 'react';

export interface TonePreset {
  name: string;
  icon: string;
  options: {
    oscillator: { type: string };
    envelope: { attack: number; decay: number; sustain: number; release: number };
  };
}

export const TONE_PRESETS: TonePreset[] = [
  {
    name: 'ピアノ',
    icon: '🎹',
    options: {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.6 },
    },
  },
  {
    name: 'オルガン',
    icon: '🎵',
    options: {
      oscillator: { type: 'sine4' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.3 },
    },
  },
  {
    name: 'シンセ',
    icon: '🎛️',
    options: {
      oscillator: { type: 'sawtooth8' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.4 },
    },
  },
  {
    name: 'ベル',
    icon: '🔔',
    options: {
      oscillator: { type: 'sine8' },
      envelope: { attack: 0.001, decay: 0.6, sustain: 0.05, release: 1.2 },
    },
  },
];

// Tone.js is loaded dynamically to avoid creating an AudioContext before user gesture
let Tone: typeof import('tone') | null = null;
let globalSynth: import('tone').PolySynth | null = null;
let initPromise: Promise<void> | null = null;

export function initAudio() {
  if (initPromise) return initPromise;
  initPromise = _initAudio();
  return initPromise;
}

async function _initAudio() {
  Tone = await import('tone');

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

  synth.triggerAttackRelease('C3', '32n', Tone.now(), 0);
}

export function setTonePreset(index: number) {
  if (!globalSynth || !Tone) return;
  const preset = TONE_PRESETS[index];
  if (!preset) return;
  globalSynth.set(preset.options as unknown as Partial<import('tone').SynthOptions>);
}

export function useSynth() {
  const disposedRef = useRef(false);

  const noteOn = useCallback((note: string) => {
    if (!disposedRef.current && globalSynth && Tone) {
      globalSynth.triggerAttack(note, Tone.now());
    }
  }, []);

  const noteOff = useCallback((note: string) => {
    if (globalSynth && Tone) {
      globalSynth.triggerRelease(note, Tone.now());
    }
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    return () => { disposedRef.current = true; };
  }, []);

  return { noteOn, noteOff };
}
