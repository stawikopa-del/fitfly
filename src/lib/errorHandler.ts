import { toast } from 'sonner';

/**
 * Centralized error handler for API calls
 * Shows user-friendly error messages via toast notifications
 */

export interface ErrorHandlerOptions {
  silent?: boolean; // Don't show toast, just log
  fallbackMessage?: string; // Custom message if error doesn't have one
  showDetails?: boolean; // Show technical details in dev mode
}

const defaultMessages: Record<string, string> = {
  'Failed to fetch': 'Brak połączenia z serwerem. Sprawdź internet.',
  'NetworkError': 'Problem z połączeniem. Spróbuj ponownie.',
  'PGRST116': 'Nie znaleziono danych.',
  'JWT expired': 'Sesja wygasła. Zaloguj się ponownie.',
  '401': 'Brak autoryzacji. Zaloguj się ponownie.',
  '403': 'Brak uprawnień do tej operacji.',
  '404': 'Nie znaleziono zasobu.',
  '500': 'Błąd serwera. Spróbuj ponownie później.',
  '503': 'Serwer niedostępny. Spróbuj ponownie później.',
};

function getErrorMessage(error: unknown): string {
  if (!error) return 'Wystąpił nieznany błąd';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    // Check for known error patterns
    for (const [pattern, message] of Object.entries(defaultMessages)) {
      if (error.message.includes(pattern)) {
        return message;
      }
    }
    return error.message;
  }
  
  // Supabase error object
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; code?: string; status?: number; error_description?: string };
    
    if (err.error_description) {
      return err.error_description;
    }
    
    if (err.code && defaultMessages[err.code]) {
      return defaultMessages[err.code];
    }
    
    if (err.status && defaultMessages[String(err.status)]) {
      return defaultMessages[String(err.status)];
    }
    
    if (err.message) {
      return err.message;
    }
  }
  
  return 'Wystąpił nieznany błąd';
}

/**
 * Handle API errors with toast notification
 */
export function handleApiError(
  error: unknown,
  context: string,
  options: ErrorHandlerOptions = {}
): void {
  const { silent = false, fallbackMessage, showDetails = false } = options;
  
  const errorMessage = getErrorMessage(error);
  const displayMessage = fallbackMessage || errorMessage;
  
  // Always log to console for debugging
  console.error(`[${context}]`, error);
  
  // Show toast unless silent
  if (!silent) {
    toast.error(displayMessage, {
      description: showDetails && process.env.NODE_ENV === 'development' 
        ? errorMessage 
        : undefined,
      duration: 4000,
    });
  }
}

/**
 * Wrapper for async operations with automatic error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  options: ErrorHandlerOptions & { onError?: (error: unknown) => void } = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, context, options);
    options.onError?.(error);
    return null;
  }
}

/**
 * Create a reusable error handler for a specific context
 */
export function createErrorHandler(context: string, defaultOptions: ErrorHandlerOptions = {}) {
  return (error: unknown, customOptions: ErrorHandlerOptions = {}) => {
    handleApiError(error, context, { ...defaultOptions, ...customOptions });
  };
}
