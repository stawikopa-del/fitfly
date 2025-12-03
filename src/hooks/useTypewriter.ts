import { useState, useEffect, useRef } from 'react';

export function useTypewriter(targetText: string, isStreaming: boolean, charDelay: number = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndexRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // Jeśli streaming się skończył, pokaż cały tekst natychmiast
    if (!isStreaming && targetText) {
      setDisplayedText(targetText);
      currentIndexRef.current = targetText.length;
      return;
    }

    const animate = (timestamp: number) => {
      // Sprawdź czy minęło wystarczająco czasu
      if (timestamp - lastUpdateRef.current >= charDelay) {
        if (currentIndexRef.current < targetText.length) {
          currentIndexRef.current += 1;
          setDisplayedText(targetText.slice(0, currentIndexRef.current));
          lastUpdateRef.current = timestamp;
        }
      }

      // Kontynuuj animację jeśli jeszcze nie wyświetliliśmy całego tekstu
      if (currentIndexRef.current < targetText.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Rozpocznij animację
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetText, isStreaming, charDelay]);

  // Reset gdy nowa konwersacja
  useEffect(() => {
    if (targetText === '') {
      setDisplayedText('');
      currentIndexRef.current = 0;
    }
  }, [targetText]);

  return displayedText;
}
