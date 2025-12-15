import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { soundFeedback } from "@/utils/soundFeedback";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // Primary - główny akcent (niebieski)
        default: 
          "bg-primary text-primary-foreground rounded-2xl shadow-playful hover:-translate-y-1 hover:shadow-playful-lg active:translate-y-0 active:shadow-playful-sm",
        
        // Secondary - zielony akcent
        secondary: 
          "bg-secondary text-secondary-foreground rounded-2xl shadow-playful-green hover:-translate-y-1 hover:shadow-playful-green-lg active:translate-y-0 active:shadow-playful-green",
        
        // Accent - pomarańczowy akcent
        accent:
          "bg-accent text-accent-foreground rounded-2xl shadow-playful-orange hover:-translate-y-1 hover:shadow-glow-orange active:translate-y-0",
        
        // Destructive - czerwony dla usuwania
        destructive: 
          "bg-destructive text-destructive-foreground rounded-2xl shadow-md hover:bg-destructive/90 hover:-translate-y-0.5",
        
        // Success - zielony sukces (subtelniejszy niż secondary)
        success:
          "bg-fitfly-green text-white rounded-2xl shadow-md hover:bg-fitfly-green-dark hover:-translate-y-0.5",
        
        // Warning - żółty ostrzeżenie
        warning:
          "bg-fitfly-yellow text-fitfly-navy rounded-2xl shadow-md hover:brightness-95 hover:-translate-y-0.5",
        
        // Outline - obramowanie primary
        outline: 
          "border-2 border-primary bg-background text-primary rounded-2xl hover:bg-primary/10 hover:-translate-y-0.5",
        
        // Outline Secondary - obramowanie zielone
        "outline-secondary": 
          "border-2 border-secondary bg-background text-secondary rounded-2xl hover:bg-secondary/10 hover:-translate-y-0.5",
        
        // Outline Destructive - obramowanie czerwone
        "outline-destructive": 
          "border-2 border-destructive bg-background text-destructive rounded-2xl hover:bg-destructive/10 hover:-translate-y-0.5",
        
        // Ghost - bez tła, subtelny hover
        ghost: 
          "text-foreground rounded-2xl hover:bg-muted hover:-translate-y-0.5",
        
        // Ghost Destructive - ghost czerwony
        "ghost-destructive": 
          "text-destructive rounded-2xl hover:bg-destructive/10 hover:-translate-y-0.5",
        
        // Soft - subtelne tło primary
        soft:
          "bg-primary/15 text-primary rounded-2xl hover:bg-primary/25 hover:-translate-y-0.5",
        
        // Soft Secondary - subtelne tło zielone
        "soft-secondary":
          "bg-secondary/15 text-secondary rounded-2xl hover:bg-secondary/25 hover:-translate-y-0.5",
        
        // Link - tylko tekst z podkreśleniem
        link: 
          "text-primary underline-offset-4 hover:underline",
        
        // Playful - gradient premium
        playful:
          "bg-gradient-to-br from-primary to-fitfly-blue-light text-primary-foreground rounded-3xl shadow-playful-lg hover:-translate-y-1.5 hover:shadow-glow-blue active:translate-y-0",
        
        // Premium - gradient ciepły
        premium:
          "bg-gradient-to-br from-fitfly-orange to-fitfly-yellow text-white rounded-3xl shadow-playful-orange hover:-translate-y-1.5 hover:shadow-glow-orange active:translate-y-0",
      },
      size: {
        default: "h-12 px-6 py-3",
        xs: "h-8 rounded-xl px-3 text-xs",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-3xl px-10 text-base",
        xl: "h-16 rounded-3xl px-12 text-lg",
        icon: "h-12 w-12 rounded-2xl",
        "icon-sm": "h-9 w-9 rounded-xl",
        "icon-lg": "h-14 w-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  sound?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, sound = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sound && !props.disabled) {
        if (variant === 'default' || variant === 'playful' || variant === 'accent' || variant === 'premium') {
          soundFeedback.primaryClick();
        } else if (variant === 'ghost' || variant === 'link' || variant === 'soft' || variant === 'soft-secondary') {
          soundFeedback.secondaryClick();
        } else if (variant === 'destructive' || variant === 'ghost-destructive' || variant === 'outline-destructive') {
          soundFeedback.buttonClick();
        } else {
          soundFeedback.buttonClick();
        }
      }
      onClick?.(e);
    };
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        onClick={handleClick}
        {...props} 
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
