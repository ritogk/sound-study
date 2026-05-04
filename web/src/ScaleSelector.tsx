import { SCALES } from './constants';

interface Props {
  selected: string;
  onSelect: (key: string) => void;
}

export function ScaleSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
      {Object.entries(SCALES).map(([key, scale]) => {
        const active = key === selected;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer whitespace-nowrap"
            style={{
              background: active ? scale.color : 'transparent',
              borderColor: active ? scale.color : '#333',
              color: active ? '#fff' : '#999',
              boxShadow: active ? `0 0 12px ${scale.color}44` : 'none',
            }}
          >
            {scale.name}
          </button>
        );
      })}
    </div>
  );
}
