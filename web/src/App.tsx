import { useState, useCallback, useMemo } from 'react';
import { SCALES, NOTE_NAMES_EN, buildKeys, buildKeyMap, buildReverseKeyMap } from './constants';
import { useSynth, initAudio } from './useSynth';
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
  const [octaves, setOctaves] = useState<1 | 2>(2);
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const [audioReady, setAudioReady] = useState(false);
  const { noteOn, noteOff } = useSynth();
  const autoPlay = useAutoPlay(noteOn, noteOff, setPressedNotes);
  const metronome = useMetronome();

  const pianoKeys = useMemo(() => buildKeys(3, 3 + octaves), [octaves]);
  const keyMap = useMemo(() => buildKeyMap(pianoKeys), [pianoKeys]);
  const reverseKeyMap = useMemo(() => buildReverseKeyMap(keyMap), [keyMap]);

  useKeyboard(keyMap, noteOn, noteOff, setPressedNotes);

  const scale = SCALES[scaleKey];
  const rootName = NOTE_NAMES_EN[rootIndex];

  const handleStartAudio = useCallback(async () => {
    await initAudio();
    setAudioReady(true);
  }, []);

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
    <div className="flex flex-col h-full px-2 sm:px-6 py-1.5 sm:py-3 gap-1 sm:gap-2 landscape-compact:gap-0.5 landscape-compact:py-0.5">
      <header className="text-center shrink-0">
        <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white landscape-compact:text-sm leading-tight">
          🎹 Sound Study
          <span className="ml-2 text-xs sm:text-sm font-normal text-[#666]">
            {rootName} {scale.name}
          </span>
        </h1>
      </header>

      <div className="flex flex-col gap-1 sm:gap-1.5 landscape-compact:gap-0.5 shrink-0">
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
          octaves={octaves}
          onOctavesChange={setOctaves}
          onAutoPlayStart={autoPlay.start}
          onAutoPlayStop={autoPlay.stop}
          onMetronomeStart={metronome.start}
          onMetronomeStop={metronome.stop}
          metronomeBeat={metronome.beat}
        />
      </div>

      <div className="flex-1 min-h-0">
        <Piano
          keys={pianoKeys}
          reverseKeyMap={reverseKeyMap}
          scaleKey={scaleKey}
          rootIndex={rootIndex}
          pressedNotes={pressedNotes}
          noteOn={handleNoteOn}
          noteOff={handleNoteOff}
        />
      </div>
    </div>
  );
}
