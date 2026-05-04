import { useEffect, useRef } from 'react';

export function useKeyboard(
  keyMap: Record<string, string>,
  noteOn: (note: string) => void,
  noteOff: (note: string) => void,
  setPressed: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
  const activeKeysRef = useRef(new Set<string>());
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const note = keyMapRef.current[key];
      if (!note || activeKeysRef.current.has(key)) return;
      activeKeysRef.current.add(key);
      setPressed(prev => new Set(prev).add(note));
      noteOn(note);
    };

    const handleUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = keyMapRef.current[key];
      if (!note) return;
      activeKeysRef.current.delete(key);
      setPressed(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      noteOff(note);
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [noteOn, noteOff, setPressed]);
}
