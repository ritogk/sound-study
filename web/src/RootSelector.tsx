import { ROOT_NOTES, SCALES } from './constants';

interface Props {
  selected: number;
  onSelect: (index: number) => void;
  scaleKey: string;
}

export function RootSelector({ selected, onSelect, scaleKey }: Props) {
  const color = SCALES[scaleKey].color;
  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
      <span className="text-[#666] text-xs sm:text-sm self-center mr-1 sm:mr-2">Root:</span>
      {ROOT_NOTES.map(({ name, index }) => {
        const active = index === selected;
        return (
          <button
            key={name}
            onClick={() => onSelect(index)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer flex items-center justify-center"
            style={{
              background: active ? color : 'transparent',
              borderColor: active ? color : '#333',
              color: active ? '#fff' : '#888',
              boxShadow: active ? `0 0 10px ${color}44` : 'none',
            }}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
