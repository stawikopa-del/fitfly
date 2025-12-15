import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-2xl border-2 bg-background px-4 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50 focus:border-primary",
        ghost: "border-transparent bg-muted/50 hover:bg-muted focus:bg-background focus:border-input",
        outline: "border-border bg-transparent hover:border-primary/50 focus:border-primary",
        error: "border-destructive hover:border-destructive focus:border-destructive focus-visible:ring-destructive",
        success: "border-secondary hover:border-secondary focus:border-secondary focus-visible:ring-secondary",
      },
      inputSize: {
        default: "h-12 py-3",
        sm: "h-10 py-2 text-sm rounded-xl",
        lg: "h-14 py-4 text-base rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps 
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
