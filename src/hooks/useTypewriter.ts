import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, isActive: boolean, speed: number = 20) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Jeśli nie jest aktywne (streaming zakończony), pokaż cały tekst
    if (!isActive) {
      setDisplayedText(text);
      indexRef.current = text.length;
      return;
    }

    // Czyść poprzedni interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Animuj tekst litera po literze
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        // Dodaj kilka liter naraz dla płynności
        const charsToAdd = Math.min(3, text.length - indexRef.current);
        indexRef.current += charsToAdd;
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, isActive, speed]);

  // Reset gdy tekst się zmienia na pusty
  useEffect(() => {
    if (text === '') {
      setDisplayedText('');
      indexRef.current = 0;
    }
  }, [text]);

  return displayedText;
}
