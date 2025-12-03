import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e27aabe06109484eb9ea37e2651d4c23',
  appName: 'FLYFIT',
  webDir: 'dist',
  server: {
    url: 'https://e27aabe0-6109-484e-b9ea-37e2651d4c23.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Pedometer: {
      // Pedometer plugin configuration
    }
  }
};

export default config;
