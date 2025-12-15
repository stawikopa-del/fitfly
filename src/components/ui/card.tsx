import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-3xl border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        // Default - standardowa karta z cieniem i hover
        default: 
          "border-2 border-border/50 shadow-card-playful hover:-translate-y-1 hover:shadow-card-playful-hover",
        
        // Elevated - większy cień, bardziej widoczna
        elevated:
          "border-border/30 shadow-lg hover:-translate-y-1.5 hover:shadow-xl",
        
        // Flat - bez cienia, minimalna
        flat:
          "border-border/50 shadow-none hover:bg-muted/30",
        
        // Ghost - bez obramowania i cienia
        ghost:
          "border-transparent shadow-none bg-transparent hover:bg-muted/50",
        
        // Interactive - wyraźna interakcja (dla kliknięć)
        interactive:
          "border-2 border-border/50 shadow-card-playful hover:-translate-y-2 hover:shadow-card-playful-hover cursor-pointer active:scale-[0.98]",
        
        // Outline - tylko obramowanie
        outline:
          "border-2 border-border bg-transparent shadow-none hover:border-primary/50 hover:bg-card/50",
        
        // Primary - akcentowana niebieska
        primary:
          "border-primary/30 bg-primary/5 shadow-md hover:-translate-y-1 hover:shadow-glow-blue hover:border-primary/50",
        
        // Secondary - akcentowana zielona
        secondary:
          "border-secondary/30 bg-secondary/5 shadow-md hover:-translate-y-1 hover:shadow-glow-green hover:border-secondary/50",
        
        // Accent - akcentowana pomarańczowa
        accent:
          "border-accent/30 bg-accent/5 shadow-md hover:-translate-y-1 hover:shadow-glow-orange hover:border-accent/50",
        
        // Glass - efekt szkła
        glass:
          "border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:-translate-y-1",
      },
      padding: {
        default: "",
        none: "[&>*]:p-0",
        sm: "[&_.card-header]:p-3 [&_.card-content]:p-3 [&_.card-footer]:p-3",
        lg: "[&_.card-header]:p-6 [&_.card-content]:p-6 [&_.card-footer]:p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(cardVariants({ variant, padding, className }))} 
      {...props} 
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-header flex flex-col space-y-1.5 p-5", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold font-display leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("card-content p-5 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-footer flex items-center p-5 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
