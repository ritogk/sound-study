import { NOTE_NAMES_JA, NOTE_NAMES_EN, SCALES } from './constants';

interface Props {
  scaleKey: string;
  rootIndex: number;
}

export function ScaleNotes({ scaleKey, rootIndex }: Props) {
  const scale = SCALES[scaleKey];
  const notes = scale.intervals.map(i => {
    const idx = (rootIndex + i) % 12;
    return { ja: NOTE_NAMES_JA[idx], en: NOTE_NAMES_EN[idx], isRoot: i === 0 };
  });

  return (
    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
      {notes.map((n, i) => (
        <div
          key={i}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center text-white font-medium transition-all duration-200"
          style={{
            background: n.isRoot ? scale.color : `${scale.color}66`,
            boxShadow: n.isRoot ? `0 0 14px ${scale.color}88` : 'none',
            border: n.isRoot ? `2px solid ${scale.color}` : '1px solid transparent',
          }}
        >
          <span className="text-[10px] sm:text-xs leading-none">{n.ja}</span>
          <span className="text-[8px] sm:text-[9px] opacity-60 leading-none mt-0.5">{n.en}</span>
        </div>
      ))}
    </div>
  );
}
