import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Rubik', 'Nunito', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // FitFly custom colors - playful mascot palette
        fitfly: {
          blue: "hsl(var(--fitfly-blue))",
          "blue-light": "hsl(var(--fitfly-blue-light))",
          "blue-dark": "hsl(var(--fitfly-blue-dark))",
          green: "hsl(var(--fitfly-green))",
          "green-light": "hsl(var(--fitfly-green-light))",
          "green-dark": "hsl(var(--fitfly-green-dark))",
          orange: "hsl(var(--fitfly-orange))",
          "orange-light": "hsl(var(--fitfly-orange-light))",
          yellow: "hsl(var(--fitfly-yellow))",
          pink: "hsl(var(--fitfly-pink))",
          purple: "hsl(var(--fitfly-purple))",
          cream: "hsl(var(--fitfly-cream))",
          navy: "hsl(var(--fitfly-navy))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pushup": {
          "0%, 100%": { transform: "translateY(0px) scaleY(1)" },
          "50%": { transform: "translateY(8px) scaleY(0.92)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px) rotate(-0.3deg)" },
          "50%": { transform: "translateY(-5px) rotate(0.3deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "80%, 100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "celebrate": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.1) rotate(-5deg)" },
          "50%": { transform: "scale(1.1) rotate(5deg)" },
          "75%": { transform: "scale(1.1) rotate(-5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up-bounce": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "60%": { transform: "translateY(-10%)" },
          "80%": { transform: "translateY(5%)" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "sway": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "scan-line": {
          "0%": { top: "0%", opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { top: "100%", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 3s ease-in-out infinite",
        "pushup": "pushup 2s ease-in-out infinite",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "celebrate": "celebrate 0.6s ease-in-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "slide-up-bounce": "slide-up-bounce 0.5s ease-out",
        "slide-up-fade": "slide-up-fade 0.3s ease-out",
        "pop": "pop 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "sway": "sway 3s ease-in-out infinite",
        "scan-line": "scan-line 2s ease-in-out infinite",
      },
      boxShadow: {
        // Playful shadows dla buttonów
        "playful": "0 4px 0 hsl(var(--fitfly-blue-dark)), 0 6px 20px hsl(var(--fitfly-blue) / 0.3)",
        "playful-sm": "0 2px 0 hsl(var(--fitfly-blue-dark)), 0 4px 10px hsl(var(--fitfly-blue) / 0.2)",
        "playful-lg": "0 6px 0 hsl(var(--fitfly-blue-dark)), 0 10px 30px hsl(var(--fitfly-blue) / 0.4)",
        "playful-green": "0 4px 0 hsl(var(--fitfly-green-dark)), 0 6px 20px hsl(var(--fitfly-green) / 0.3)",
        "playful-green-lg": "0 6px 0 hsl(var(--fitfly-green-dark)), 0 10px 30px hsl(var(--fitfly-green) / 0.4)",
        "playful-orange": "0 4px 0 hsl(var(--fitfly-orange) / 0.8), 0 6px 20px hsl(var(--fitfly-orange) / 0.3)",
        
        // Card shadows
        "card-playful": "0 8px 30px -10px hsl(var(--fitfly-blue) / 0.15)",
        "card-playful-hover": "0 16px 40px -10px hsl(var(--fitfly-blue) / 0.25)",
        "card-elevated": "0 12px 40px -15px hsl(var(--foreground) / 0.15)",
        "card-elevated-hover": "0 20px 50px -15px hsl(var(--foreground) / 0.2)",
        
        // Glow effects
        "glow-blue": "0 0 20px hsl(var(--fitfly-blue) / 0.4)",
        "glow-green": "0 0 20px hsl(var(--fitfly-green) / 0.4)",
        "glow-orange": "0 0 20px hsl(var(--fitfly-orange) / 0.4)",
        "glow-primary": "0 0 25px hsl(var(--primary) / 0.35)",
        
        // Subtle shadows
        "soft": "0 2px 8px hsl(var(--foreground) / 0.06)",
        "soft-lg": "0 4px 16px hsl(var(--foreground) / 0.08)",
      },
      
      // Spacing tokens dla spójności
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
