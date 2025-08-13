import { useEffect, useMemo } from 'react';

export function useDebounce<T>(
  callback: (value: T) => void,
  delay: number = 300
) {
  const debouncedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debounced = (value: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(value), delay);
    };
    
    debounced.cancel = () => clearTimeout(timeoutId);
    
    return debounced;
  }, [callback, delay]);

  useEffect(() => {
    return () => debouncedCallback.cancel();
  }, [debouncedCallback]);

  return debouncedCallback;
}