let ctx: AudioContext | null = null;

const activeVoices = new Map<string, { osc: OscillatorNode; gain: GainNode }>();

const NOTE_FREQ: Record<string, number> = {};
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
for (let oct = 0; oct <= 8; oct++) {
  for (let i = 0; i < 12; i++) {
    const midi = oct * 12 + i + 12;
    NOTE_FREQ[`${NOTE_NAMES[i]}${oct}`] = 440 * Math.pow(2, (midi - 69) / 12);
  }
}

const ATTACK = 0.003;
const RELEASE = 0.4;

function getCtx(): AudioContext {
  if (!ctx) throw new Error('Audio not initialized');
  return ctx;
}

export async function initAudio() {
  ctx = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
  await ctx.resume();
  // Warm up: create and immediately discard a short oscillator
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  g.gain.value = 0;
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
}

export function noteOn(note: string) {
  const c = getCtx();
  const freq = NOTE_FREQ[note];
  if (!freq) return;

  // If already playing, release first
  if (activeVoices.has(note)) {
    noteOff(note);
  }

  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;

  const gain = c.createGain();
  const now = c.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + ATTACK);

  osc.connect(gain).connect(c.destination);
  osc.start(now);

  activeVoices.set(note, { osc, gain });
}

export function noteOff(note: string) {
  const voice = activeVoices.get(note);
  if (!voice) return;
  activeVoices.delete(note);

  const c = getCtx();
  const now = c.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
  voice.gain.gain.linearRampToValueAtTime(0, now + RELEASE);
  voice.osc.stop(now + RELEASE + 0.05);
}

// --- Metronome ---

let metronomeTimer: number | null = null;
let metronomeBeatCount = 0;
let metronomeCallback: ((beat: number) => void) | null = null;

export function startMetronome(bpm: number, onBeat: (beat: number) => void) {
  stopMetronome();
  const c = getCtx();
  metronomeBeatCount = 0;
  metronomeCallback = onBeat;

  const interval = 60 / bpm;
  let nextTime = c.currentTime + 0.05;

  const schedule = () => {
    while (nextTime < c.currentTime + 0.1) {
      const isDownbeat = metronomeBeatCount % 4 === 0;
      const freq = isDownbeat ? 880 : 440;
      const vol = isDownbeat ? 0.3 : 0.15;

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = c.createGain();
      gain.gain.setValueAtTime(vol, nextTime);
      gain.gain.exponentialRampToValueAtTime(0.001, nextTime + 0.05);

      osc.connect(gain).connect(c.destination);
      osc.start(nextTime);
      osc.stop(nextTime + 0.06);

      const beat = metronomeBeatCount % 4;
      const targetTime = nextTime;
      setTimeout(() => metronomeCallback?.(beat), (targetTime - c.currentTime) * 1000);

      metronomeBeatCount++;
      nextTime += interval;
    }

    metronomeTimer = requestAnimationFrame(schedule);
  };

  schedule();
}

export function stopMetronome() {
  if (metronomeTimer !== null) {
    cancelAnimationFrame(metronomeTimer);
    metronomeTimer = null;
  }
  metronomeBeatCount = 0;
  metronomeCallback = null;
}
