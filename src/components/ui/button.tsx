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
        default: 
          "bg-primary text-primary-foreground rounded-2xl shadow-playful hover:-translate-y-1 hover:shadow-playful-lg active:translate-y-0 active:shadow-playful-sm",
        destructive: 
          "bg-destructive text-destructive-foreground rounded-2xl shadow-md hover:bg-destructive/90 hover:-translate-y-0.5",
        outline: 
          "border-2 border-primary bg-background text-primary rounded-2xl hover:bg-primary/10 hover:-translate-y-0.5",
        secondary: 
          "bg-secondary text-secondary-foreground rounded-2xl shadow-playful-green hover:-translate-y-1 hover:shadow-glow-green active:translate-y-0",
        ghost: 
          "text-foreground rounded-2xl hover:bg-muted hover:-translate-y-0.5",
        link: 
          "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground rounded-2xl shadow-playful-orange hover:-translate-y-1 hover:shadow-glow-orange active:translate-y-0",
        playful:
          "bg-gradient-to-br from-primary to-fitfly-blue-light text-primary-foreground rounded-3xl shadow-playful-lg hover:-translate-y-1.5 hover:shadow-glow-blue active:translate-y-0",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-3xl px-10 text-base",
        icon: "h-12 w-12 rounded-2xl",
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
        if (variant === 'default' || variant === 'playful' || variant === 'accent') {
          soundFeedback.primaryClick();
        } else if (variant === 'ghost' || variant === 'link') {
          soundFeedback.secondaryClick();
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
