import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Filled variants
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-fitfly-green text-white hover:bg-fitfly-green-dark",
        warning: "border-transparent bg-fitfly-yellow text-fitfly-navy hover:brightness-95",
        
        // Outline variants
        outline: "border-current text-foreground bg-transparent",
        "outline-primary": "border-primary text-primary bg-transparent",
        "outline-secondary": "border-secondary text-secondary bg-transparent",
        "outline-destructive": "border-destructive text-destructive bg-transparent",
        
        // Soft variants (subtle background)
        soft: "border-transparent bg-muted text-muted-foreground",
        "soft-primary": "border-transparent bg-primary/15 text-primary",
        "soft-secondary": "border-transparent bg-secondary/15 text-secondary",
        "soft-accent": "border-transparent bg-accent/15 text-accent",
        "soft-destructive": "border-transparent bg-destructive/15 text-destructive",
        "soft-success": "border-transparent bg-fitfly-green/15 text-fitfly-green",
        "soft-warning": "border-transparent bg-fitfly-yellow/15 text-fitfly-yellow",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
