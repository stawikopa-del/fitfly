import { useState, useCallback, useEffect } from 'react';

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  try {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  } catch {
    return '';
  }
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  try {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  } catch {
    return new ArrayBuffer(0);
  }
}

interface StoredCredential {
  id: string;
  rawId: string;
  userId: string;
  email: string;
}

export function useWebAuthn() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check support in useEffect to avoid SSR issues
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const supported = !!window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function';
      setIsSupported(supported);
    } catch {
      setIsSupported(false);
    }
  }, []);

  // Check if user has registered biometric
  const hasRegisteredBiometric = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('webauthn_credential');
      return !!stored;
    } catch {
      return false;
    }
  }, []);

  // Get stored credential
  const getStoredCredential = useCallback((): StoredCredential | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('webauthn_credential');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  // Register biometric for current user
  const registerBiometric = useCallback(async (userId: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Nie dostępne w tym środowisku' };
    }
    
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
          displayName: email.split('@')[0] || 'User',
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

      try {
        localStorage.setItem('webauthn_credential', JSON.stringify(storedCredential));
      } catch {
        return { success: false, error: 'Nie udało się zapisać poświadczenia' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('WebAuthn registration error:', error);
      
      if (error?.name === 'NotAllowedError') {
        return { success: false, error: 'Dostęp do biometrii został odrzucony' };
      }
      if (error?.name === 'NotSupportedError') {
        return { success: false, error: 'Biometria nie jest wspierana na tym urządzeniu' };
      }
      
      return { success: false, error: 'Wystąpił błąd podczas rejestracji biometrii' };
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported]);

  // Authenticate with biometric
  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; email?: string; error?: string }> => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Nie dostępne w tym środowisku' };
    }
    
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

      const rawIdBuffer = base64ToBuffer(storedCredential.rawId);
      if (rawIdBuffer.byteLength === 0) {
        return { success: false, error: 'Nieprawidłowe dane poświadczenia' };
      }

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: rawIdBuffer,
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
      
      if (error?.name === 'NotAllowedError') {
        return { success: false, error: 'Dostęp do biometrii został odrzucony' };
      }
      
      return { success: false, error: 'Wystąpił błąd podczas uwierzytelniania' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isSupported, getStoredCredential]);

  // Remove stored biometric
  const removeBiometric = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('webauthn_credential');
    } catch {
      // Ignore storage errors
    }
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