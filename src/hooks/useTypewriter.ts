import { useState, useEffect, useRef, useCallback } from 'react';

export function useTypewriter(targetText: string, isStreaming: boolean, charDelay: number = 20) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const targetRef = useRef(targetText);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Aktualizuj ref'y
  targetRef.current = targetText;
  isStreamingRef.current = isStreaming;

  // Funkcja do czyszczenia intervalu
  const clearIntervalSafe = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Główny efekt
  useEffect(() => {
    // Jeśli streaming się skończył
    if (!isStreaming) {
      clearIntervalSafe();
      setDisplayedText(targetText);
      indexRef.current = targetText.length;
      return;
    }

    // Jeśli już mamy interval, nie twórz nowego
    if (intervalRef.current) return;

    // Startuj interval
    intervalRef.current = setInterval(() => {
      const target = targetRef.current;
      const currentIndex = indexRef.current;
      
      if (currentIndex < target.length) {
        indexRef.current = currentIndex + 1;
        setDisplayedText(target.slice(0, indexRef.current));
      }
    }, charDelay);

    // Cleanup tylko przy unmount
    return () => {
      clearIntervalSafe();
    };
  }, [isStreaming]); // Tylko isStreaming w dependencies!

  // Reset przy nowej konwersacji
  useEffect(() => {
    if (targetText === '' && displayedText !== '') {
      clearIntervalSafe();
      setDisplayedText('');
      indexRef.current = 0;
    }
  }, [targetText, displayedText, clearIntervalSafe]);

  return displayedText;
}
