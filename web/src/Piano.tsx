import { useCallback } from 'react';
import { SCALES, isInScale, isRoot, type KeyInfo } from './constants';

interface Props {
  keys: KeyInfo[];
  reverseKeyMap: Record<string, string>;
  scaleKey: string;
  rootIndex: number;
  pressedNotes: Set<string>;
  noteOn: (note: string) => void;
  noteOff: (note: string) => void;
}

export function Piano({ keys, reverseKeyMap, scaleKey, rootIndex, pressedNotes, noteOn, noteOff }: Props) {
  const scale = SCALES[scaleKey];
  const whiteKeys = keys.filter(k => !k.isBlack);
  const totalWhite = whiteKeys.length;

  return (
    <div
      className="relative mx-auto select-none h-full"
      style={{ width: '100%', maxWidth: `${totalWhite * 52}px` }}
    >
      {whiteKeys.map((key, i) => (
        <WhiteKey
          key={key.note}
          keyInfo={key}
          index={i}
          totalWhite={totalWhite}
          scale={scale}
          rootIndex={rootIndex}
          isPressed={pressedNotes.has(key.note)}
          noteOn={noteOn}
          noteOff={noteOff}
          reverseKeyMap={reverseKeyMap}
        />
      ))}
      {keys.filter(k => k.isBlack).map(key => {
        const whiteIdx = whiteKeys.findIndex(w => key.midi === w.midi + 1);
        return (
          <BlackKey
            key={key.note}
            keyInfo={key}
            whiteIndex={whiteIdx}
            totalWhite={totalWhite}
            scale={scale}
            rootIndex={rootIndex}
            isPressed={pressedNotes.has(key.note)}
            noteOn={noteOn}
            noteOff={noteOff}
            reverseKeyMap={reverseKeyMap}
          />
        );
      })}
    </div>
  );
}

interface KeyProps {
  keyInfo: KeyInfo;
  scale: { color: string; intervals: number[] };
  rootIndex: number;
  isPressed: boolean;
  noteOn: (note: string) => void;
  noteOff: (note: string) => void;
  reverseKeyMap: Record<string, string>;
}

function WhiteKey({ keyInfo, index, totalWhite, scale, rootIndex, isPressed, noteOn, noteOff, reverseKeyMap }: KeyProps & { index: number; totalWhite: number }) {
  const inScale = isInScale(keyInfo.semitone, rootIndex, scale.intervals);
  const isRootNote = isRoot(keyInfo.semitone, rootIndex);
  const keyBind = reverseKeyMap[keyInfo.note];

  const widthPct = 100 / totalWhite;
  const leftPct = index * widthPct;

  let bg = '#e8e8e8';
  let textColor = '#555';
  let shadow = 'none';

  if (isPressed) {
    bg = inScale ? scale.color : '#ccc';
    shadow = `0 0 20px ${inScale ? scale.color : '#fff'}88`;
    textColor = '#fff';
  } else if (inScale) {
    bg = isRootNote ? scale.color : `${scale.color}55`;
    textColor = isRootNote ? '#fff' : '#ddd';
    if (isRootNote) shadow = `0 0 10px ${scale.color}66`;
  } else {
    bg = '#2a2a30';
    textColor = '#555';
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    noteOn(keyInfo.note);
  }, [noteOn, keyInfo.note]);

  const handlePointerUp = useCallback(() => {
    noteOff(keyInfo.note);
  }, [noteOff, keyInfo.note]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute bottom-0 rounded-b-lg flex flex-col items-center justify-end pb-2 transition-colors duration-150 cursor-pointer border border-[#1a1a1f]"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        height: '100%',
        background: bg,
        boxShadow: shadow,
        color: textColor,
        zIndex: 1,
      }}
    >
      <span className="text-[9px] sm:text-[10px] font-bold leading-none">{keyInfo.nameJa}</span>
      {keyBind && (
        <span className="text-[7px] sm:text-[8px] opacity-40 mt-0.5 uppercase">{keyBind}</span>
      )}
    </div>
  );
}

function BlackKey({ keyInfo, whiteIndex, totalWhite, scale, rootIndex, isPressed, noteOn, noteOff, reverseKeyMap }: KeyProps & { whiteIndex: number; totalWhite: number }) {
  const inScale = isInScale(keyInfo.semitone, rootIndex, scale.intervals);
  const isRootNote = isRoot(keyInfo.semitone, rootIndex);
  const keyBind = reverseKeyMap[keyInfo.note];

  const widthPct = 100 / totalWhite;
  const leftPct = (whiteIndex + 0.65) * widthPct;
  const blackWidthPct = widthPct * 0.7;

  let bg = '#1a1a1f';
  let textColor = '#555';
  let shadow = 'none';

  if (isPressed) {
    bg = inScale ? scale.color : '#555';
    shadow = `0 0 20px ${inScale ? scale.color : '#fff'}88`;
    textColor = '#fff';
  } else if (inScale) {
    bg = isRootNote ? scale.color : `${scale.color}88`;
    textColor = isRootNote ? '#fff' : '#ddd';
    if (isRootNote) shadow = `0 0 10px ${scale.color}66`;
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    noteOn(keyInfo.note);
  }, [noteOn, keyInfo.note]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    noteOff(keyInfo.note);
  }, [noteOff, keyInfo.note]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute top-0 rounded-b-md flex flex-col items-center justify-end pb-1.5 transition-colors duration-150 cursor-pointer"
      style={{
        left: `${leftPct}%`,
        width: `${blackWidthPct}%`,
        height: '62%',
        background: bg,
        boxShadow: shadow,
        color: textColor,
        zIndex: 2,
      }}
    >
      <span className="text-[7px] sm:text-[8px] font-bold leading-none">{keyInfo.nameJa}</span>
      {keyBind && (
        <span className="text-[6px] sm:text-[7px] opacity-40 mt-0.5 uppercase">{keyBind}</span>
      )}
    </div>
  );
}
