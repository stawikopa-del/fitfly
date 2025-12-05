import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

interface StoredCredential {
  id: string;
  rawId: string;
  userId: string;
  email: string;
}

export function useWebAuthn() {
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function';
    } catch {
      return false;
    }
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if user has registered biometric
  const hasRegisteredBiometric = useCallback((): boolean => {
    const stored = localStorage.getItem('webauthn_credential');
    return !!stored;
  }, []);

  // Get stored credential
  const getStoredCredential = useCallback((): StoredCredential | null => {
    const stored = localStorage.getItem('webauthn_credential');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  // Register biometric for current user
  const registerBiometric = useCallback(async (userId: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupported) {
      return { success: false, error: 'WebAuthn nie jest wspierane na tym urządzeniu' };
    }

    setIsRegistering(true);

    try {
      // Generate random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'FITFLY',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Use built-in authenticator (Face ID, Touch ID)
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Nie udało się utworzyć poświadczenia' };
      }

      // Store credential info locally
      const storedCredential: StoredCredential = {
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        userId,
        email,
      };

      localStorage.setItem('webauthn_credential', JSON.stringify(storedCredential));

      return { success: true };
    } catch (error: any) {
      console.error('WebAuthn registration error:', error);
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Dostęp do biometrii został odrzucony' };
      }
      if (error.name === 'NotSupportedError') {
        return { success: false, error: 'Biometria nie jest wspierana na tym urządzeniu' };
      }
      
      return { success: false, error: 'Wystąpił błąd podczas rejestracji biometrii' };
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported]);

  // Authenticate with biometric
  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; email?: string; error?: string }> => {
    if (!isSupported) {
      return { success: false, error: 'WebAuthn nie jest wspierane na tym urządzeniu' };
    }

    const storedCredential = getStoredCredential();
    if (!storedCredential) {
      return { success: false, error: 'Nie znaleziono zapisanej biometrii' };
    }

    setIsAuthenticating(true);

    try {
      // Generate random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: base64ToBuffer(storedCredential.rawId),
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        return { success: false, error: 'Uwierzytelnianie nie powiodło się' };
      }

      // Verification successful - return stored email for auto-login
      return { 
        success: true, 
        email: storedCredential.email,
      };
    } catch (error: any) {
      console.error('WebAuthn authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Dostęp do biometrii został odrzucony' };
      }
      
      return { success: false, error: 'Wystąpił błąd podczas uwierzytelniania' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isSupported, getStoredCredential]);

  // Remove stored biometric
  const removeBiometric = useCallback(() => {
    localStorage.removeItem('webauthn_credential');
  }, []);

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    hasRegisteredBiometric,
    getStoredCredential,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
  };
}
