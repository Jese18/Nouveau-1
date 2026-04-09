import { useState, useEffect, useCallback, useRef } from 'react';

export function useBarcodeScanner() {
  const [scannedCode, setScannedCode] = useState<string>('');
  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  const reset = useCallback(() => {
    setScannedCode('');
    bufferRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (timeDiff > 100 && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        
        if (bufferRef.current.length > 0) {
          setScannedCode(bufferRef.current);
          bufferRef.current = '';
        }
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        bufferRef.current += event.key;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 0) {
            setScannedCode(bufferRef.current);
            bufferRef.current = '';
          }
        }, 200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scannedCode, reset };
}
