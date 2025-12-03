import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
}

export function TypewriterText({ text, isStreaming }: TypewriterTextProps) {
  const displayedText = useTypewriter(text, isStreaming, 15);

  return (
    <>
      {displayedText}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </>
  );
}
