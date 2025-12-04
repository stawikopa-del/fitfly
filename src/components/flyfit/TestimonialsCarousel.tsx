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
    text: "Dzięki FITKOWI mam motywację każdego dnia. To jak posiadanie osobistego trenera w kieszeni!",
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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const current = testimonials[currentIndex];

  return (
    <div className="text-center bg-muted/30 rounded-2xl p-5 border border-border/30 overflow-hidden">
      <div className="flex justify-center gap-1 mb-3">
        {[...Array(current.rating)].map((_, i) => (
          <span key={i} className="text-yellow-500">⭐</span>
        ))}
      </div>
      
      <div className="min-h-[70px] flex items-center justify-center">
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isAnimating 
              ? "opacity-0 translate-y-4" 
              : "opacity-100 translate-y-0"
          )}
        >
          <p className="text-sm font-medium text-foreground">
            "{current.text}"
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            — {current.author}, {current.role}
          </p>
        </div>
      </div>

      {/* Dots navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
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
