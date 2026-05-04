import { useState, useCallback, useEffect } from 'react';
import { SCALES } from './constants';
import { TONE_PRESETS, setTonePreset } from './useSynth';

interface Props {
  scaleKey: string;
  rootIndex: number;
  octaves: 1 | 2;
  onOctavesChange: (v: 1 | 2) => void;
  onAutoPlayStart: (scaleKey: string, rootIndex: number, bpm: number, octaves: number) => void;
  onAutoPlayStop: () => void;
  onMetronomeStart: (bpm: number) => void;
  onMetronomeStop: () => void;
  metronomeBeat: number;
}

export function Controls({
  scaleKey,
  rootIndex,
  octaves,
  onOctavesChange,
  onAutoPlayStart,
  onAutoPlayStop,
  onMetronomeStart,
  onMetronomeStop,
  metronomeBeat,
}: Props) {
  const [bpm, setBpm] = useState(100);
  const [toneIdx, setToneIdx] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const color = SCALES[scaleKey].color;

  const handleToneChange = useCallback((idx: number) => {
    setToneIdx(idx);
    setTonePreset(idx);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (autoPlaying) {
      onAutoPlayStop();
      setAutoPlaying(false);
    } else {
      onAutoPlayStart(scaleKey, rootIndex, bpm, octaves);
      setAutoPlaying(true);
    }
  }, [autoPlaying, scaleKey, rootIndex, bpm, onAutoPlayStart, onAutoPlayStop]);

  const toggleMetronome = useCallback(() => {
    if (metronomeOn) {
      onMetronomeStop();
      setMetronomeOn(false);
    } else {
      onMetronomeStart(bpm);
      setMetronomeOn(true);
    }
  }, [metronomeOn, bpm, onMetronomeStart, onMetronomeStop]);

  useEffect(() => {
    if (autoPlaying) onAutoPlayStart(scaleKey, rootIndex, bpm, octaves);
  }, [bpm]);

  useEffect(() => {
    if (metronomeOn) onMetronomeStart(bpm);
  }, [bpm]);

  useEffect(() => {
    if (autoPlaying) onAutoPlayStart(scaleKey, rootIndex, bpm, octaves);
  }, [scaleKey, rootIndex]);

  useEffect(() => {
    return () => {
      onAutoPlayStop();
      onMetronomeStop();
    };
  }, [onAutoPlayStop, onMetronomeStop]);

  const beatDots = [0, 1, 2, 3];

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex items-center gap-2 w-max mx-auto">
        {/* Octave */}
        <div className="flex items-center gap-0.5">
          <span className="text-[#555] text-[10px]">Oct</span>
          {([1, 2] as const).map(n => (
            <button
              key={n}
              onClick={() => onOctavesChange(n)}
              className="w-6 h-6 rounded text-[10px] font-medium border cursor-pointer transition-all duration-200 flex items-center justify-center"
              style={{
                background: octaves === n ? color : 'transparent',
                borderColor: octaves === n ? color : '#333',
                color: octaves === n ? '#fff' : '#888',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#333]" />

        {/* Tone */}
        <div className="flex items-center gap-0.5">
          {TONE_PRESETS.map((preset, i) => (
            <button
              key={preset.name}
              onClick={() => handleToneChange(i)}
              className="w-6 h-6 rounded text-[11px] border cursor-pointer transition-all duration-200 flex items-center justify-center"
              style={{
                background: toneIdx === i ? color : 'transparent',
                borderColor: toneIdx === i ? color : '#333',
              }}
              title={preset.name}
            >
              {preset.icon}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#333]" />

        {/* BPM */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBpm(b => Math.max(40, b - 10))}
            className="w-6 h-6 rounded bg-[#1a1a22] text-[#888] border border-[#333] text-[11px] cursor-pointer"
          >
            −
          </button>
          <span className="text-white text-[11px] font-mono w-6 text-center">{bpm}</span>
          <button
            onClick={() => setBpm(b => Math.min(200, b + 10))}
            className="w-6 h-6 rounded bg-[#1a1a22] text-[#888] border border-[#333] text-[11px] cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="w-px h-4 bg-[#333]" />

        {/* Auto-play */}
        <button
          onClick={toggleAutoPlay}
          className="h-6 px-2 rounded text-[10px] font-medium border cursor-pointer transition-all duration-200 whitespace-nowrap"
          style={{
            background: autoPlaying ? color : 'transparent',
            borderColor: autoPlaying ? color : '#333',
            color: autoPlaying ? '#fff' : '#999',
          }}
        >
          {autoPlaying ? '⏹' : '▶'} 自動
        </button>

        {/* Metronome */}
        <button
          onClick={toggleMetronome}
          className="h-6 px-2 rounded text-[10px] font-medium border cursor-pointer transition-all duration-200 whitespace-nowrap"
          style={{
            background: metronomeOn ? '#F59E0B' : 'transparent',
            borderColor: metronomeOn ? '#F59E0B' : '#333',
            color: metronomeOn ? '#fff' : '#999',
          }}
        >
          {metronomeOn ? '⏹' : '🔔'}
        </button>

        {metronomeOn && (
          <div className="flex gap-0.5">
            {beatDots.map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-100"
                style={{
                  background: metronomeBeat === i ? (i === 0 ? '#F59E0B' : '#fff') : '#333',
                  transform: metronomeBeat === i ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
