import { useState, useCallback } from 'react';
import { SCALES, NOTE_NAMES_EN } from './constants';
import { useSynth } from './useSynth';
import { useKeyboard } from './useKeyboard';
import { useAutoPlay } from './useAutoPlay';
import { useMetronome } from './useMetronome';
import { ScaleSelector } from './ScaleSelector';
import { RootSelector } from './RootSelector';
import { ScaleNotes } from './ScaleNotes';
import { Piano } from './Piano';
import { Controls } from './Controls';

export default function App() {
  const [scaleKey, setScaleKey] = useState('major');
  const [rootIndex, setRootIndex] = useState(0);
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const [audioReady, setAudioReady] = useState(false);
  const { noteOn, noteOff, ensureAudio } = useSynth();
  const autoPlay = useAutoPlay(noteOn, noteOff, setPressedNotes);
  const metronome = useMetronome();

  useKeyboard(noteOn, noteOff, setPressedNotes);

  const scale = SCALES[scaleKey];
  const rootName = NOTE_NAMES_EN[rootIndex];

  const handleStartAudio = useCallback(async () => {
    await ensureAudio();
    setAudioReady(true);
  }, [ensureAudio]);

  const handleNoteOn = useCallback((note: string) => {
    setPressedNotes(prev => new Set(prev).add(note));
    noteOn(note);
  }, [noteOn]);

  const handleNoteOff = useCallback((note: string) => {
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    noteOff(note);
  }, [noteOff]);

  if (!audioReady) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-4 cursor-pointer"
        onClick={handleStartAudio}
        onTouchEnd={handleStartAudio}
      >
        <div className="text-5xl">🎹</div>
        <h1 className="text-2xl font-bold text-white">Sound Study</h1>
        <p className="text-[#666] text-sm">タップして開始</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-3 sm:px-6 py-2 sm:py-4 gap-2 sm:gap-3 landscape-compact:gap-1 landscape-compact:py-1">
      <header className="text-center shrink-0">
        <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white landscape-compact:text-sm">
          🎹 Sound Study
          <span className="ml-2 text-xs sm:text-sm font-normal text-[#666]">
            {rootName} {scale.name}
          </span>
        </h1>
      </header>

      <div className="flex flex-col gap-1.5 sm:gap-2 landscape-compact:gap-1 shrink-0">
        <ScaleSelector selected={scaleKey} onSelect={setScaleKey} />
        <RootSelector selected={rootIndex} onSelect={setRootIndex} scaleKey={scaleKey} />
      </div>

      <div className="shrink-0 landscape-compact:hidden">
        <ScaleNotes scaleKey={scaleKey} rootIndex={rootIndex} />
      </div>

      <div className="shrink-0">
        <Controls
          scaleKey={scaleKey}
          rootIndex={rootIndex}
          onAutoPlayStart={autoPlay.start}
          onAutoPlayStop={autoPlay.stop}
          onMetronomeStart={metronome.start}
          onMetronomeStop={metronome.stop}
          metronomeBeat={metronome.beat}
        />
      </div>

      <div className="flex-1 flex items-end min-h-0 pb-1 sm:pb-3 landscape-compact:pb-0.5">
        <Piano
          scaleKey={scaleKey}
          rootIndex={rootIndex}
          pressedNotes={pressedNotes}
          noteOn={handleNoteOn}
          noteOff={handleNoteOff}
        />
      </div>

      <footer className="text-center text-[10px] sm:text-xs text-[#444] shrink-0 pb-1 landscape-compact:hidden">
        PCキーボード A〜B 列で演奏 ／ マウス・タッチでも操作可能
      </footer>
    </div>
  );
}
