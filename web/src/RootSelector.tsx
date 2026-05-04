import { ROOT_NOTES, SCALES } from './constants';

interface Props {
  selected: number;
  onSelect: (index: number) => void;
  scaleKey: string;
}

export function RootSelector({ selected, onSelect, scaleKey }: Props) {
  const color = SCALES[scaleKey].color;
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex gap-1 w-max items-center">
        <span className="text-[#666] text-xs mr-0.5">Root:</span>
        {ROOT_NOTES.map(({ name, index }) => {
          const active = index === selected;
          return (
            <button
              key={name}
              onClick={() => onSelect(index)}
              className="w-7 h-7 rounded-full text-[11px] sm:text-sm font-medium transition-all duration-200 border cursor-pointer flex items-center justify-center"
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
    </div>
  );
}
