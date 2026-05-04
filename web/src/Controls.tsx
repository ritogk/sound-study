import { useState, useCallback, useEffect } from 'react';
import { SCALES } from './constants';

interface Props {
  scaleKey: string;
  rootIndex: number;
  onAutoPlayStart: (scaleKey: string, rootIndex: number, bpm: number) => void;
  onAutoPlayStop: () => void;
  onMetronomeStart: (bpm: number) => void;
  onMetronomeStop: () => void;
  metronomeBeat: number;
}

export function Controls({
  scaleKey,
  rootIndex,
  onAutoPlayStart,
  onAutoPlayStop,
  onMetronomeStart,
  onMetronomeStop,
  metronomeBeat,
}: Props) {
  const [bpm, setBpm] = useState(100);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const color = SCALES[scaleKey].color;

  const toggleAutoPlay = useCallback(() => {
    if (autoPlaying) {
      onAutoPlayStop();
      setAutoPlaying(false);
    } else {
      onAutoPlayStart(scaleKey, rootIndex, bpm);
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

  // Restart running features when BPM changes
  useEffect(() => {
    if (autoPlaying) onAutoPlayStart(scaleKey, rootIndex, bpm);
  }, [bpm]);

  useEffect(() => {
    if (metronomeOn) onMetronomeStart(bpm);
  }, [bpm]);

  // Restart auto-play when scale/root changes
  useEffect(() => {
    if (autoPlaying) onAutoPlayStart(scaleKey, rootIndex, bpm);
  }, [scaleKey, rootIndex]);

  // Stop auto-play on unmount
  useEffect(() => {
    return () => {
      onAutoPlayStop();
      onMetronomeStop();
    };
  }, [onAutoPlayStop, onMetronomeStop]);

  const beatDots = [0, 1, 2, 3];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {/* BPM control */}
      <div className="flex items-center gap-2">
        <span className="text-[#666] text-xs">BPM</span>
        <button
          onClick={() => setBpm(b => Math.max(40, b - 10))}
          className="w-7 h-7 rounded-md bg-[#1a1a22] text-[#888] border border-[#333] text-sm cursor-pointer hover:border-[#555] transition-colors"
        >
          −
        </button>
        <span className="text-white text-sm font-mono w-8 text-center">{bpm}</span>
        <button
          onClick={() => setBpm(b => Math.min(200, b + 10))}
          className="w-7 h-7 rounded-md bg-[#1a1a22] text-[#888] border border-[#333] text-sm cursor-pointer hover:border-[#555] transition-colors"
        >
          +
        </button>
      </div>

      {/* Auto-play */}
      <button
        onClick={toggleAutoPlay}
        className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border cursor-pointer transition-all duration-200 whitespace-nowrap"
        style={{
          background: autoPlaying ? color : 'transparent',
          borderColor: autoPlaying ? color : '#333',
          color: autoPlaying ? '#fff' : '#999',
          boxShadow: autoPlaying ? `0 0 12px ${color}44` : 'none',
        }}
      >
        {autoPlaying ? '⏹ 自動演奏 停止' : '▶ 自動演奏'}
      </button>

      {/* Metronome */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMetronome}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border cursor-pointer transition-all duration-200 whitespace-nowrap"
          style={{
            background: metronomeOn ? '#F59E0B' : 'transparent',
            borderColor: metronomeOn ? '#F59E0B' : '#333',
            color: metronomeOn ? '#fff' : '#999',
            boxShadow: metronomeOn ? `0 0 12px #F59E0B44` : 'none',
          }}
        >
          {metronomeOn ? '⏹ メトロノーム' : '🔔 メトロノーム'}
        </button>
        {metronomeOn && (
          <div className="flex gap-1">
            {beatDots.map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all duration-100"
                style={{
                  background: metronomeBeat === i
                    ? (i === 0 ? '#F59E0B' : '#fff')
                    : '#333',
                  boxShadow: metronomeBeat === i
                    ? `0 0 8px ${i === 0 ? '#F59E0B' : '#fff'}88`
                    : 'none',
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
