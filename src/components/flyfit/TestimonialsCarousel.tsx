import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    text: "FITFLY zmienił moje podejście do zdrowia! Schudłam 8 kg w 3 miesiące bez stresu.",
    author: "Anna K.",
    role: "użytkowniczka pakietu FIT",
    rating: 5,
  },
  {
    text: "Dzięki FITEK mam motywację każdego dnia. To jak posiadanie osobistego trenera w kieszeni!",
    author: "Michał W.",
    role: "użytkownik pakietu PREMIUM",
    rating: 5,
  },
  {
    text: "Proste śledzenie posiłków i wody pomogło mi wypracować zdrowe nawyki. Polecam każdemu!",
    author: "Kasia M.",
    role: "użytkowniczka pakietu FIT",
    rating: 5,
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="text-center bg-muted/30 rounded-2xl p-5 border border-border/30">
      <div className="flex justify-center gap-1 mb-3">
        {[...Array(current.rating)].map((_, i) => (
          <span key={i} className="text-yellow-500">⭐</span>
        ))}
      </div>
      
      <div className="min-h-[60px] flex items-center justify-center">
        <p 
          key={currentIndex}
          className="text-sm font-medium text-foreground animate-fade-in"
        >
          "{current.text}"
        </p>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        — {current.author}, {current.role}
      </p>

      {/* Dots navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Opinia ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
