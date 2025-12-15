/**
 * Async operation queue to prevent race conditions
 * Ensures operations execute sequentially without conflicts
 */

type QueuedOperation<T> = {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

export class AsyncQueue {
  private queue: QueuedOperation<any>[] = [];
  private isProcessing = false;
  private aborted = false;

  /**
   * Add an operation to the queue
   * Returns a promise that resolves when the operation completes
   */
  async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (this.aborted) {
      return Promise.reject(new Error('Queue has been aborted'));
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ execute: operation, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued operations sequentially
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && !this.aborted) {
      const item = this.queue.shift();
      if (!item) continue;

      try {
        const result = await item.execute();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear the queue and reject all pending operations
   */
  abort(): void {
    this.aborted = true;
    const pending = this.queue.splice(0);
    pending.forEach(item => item.reject(new Error('Queue aborted')));
  }

  /**
   * Reset the queue for reuse
   */
  reset(): void {
    this.aborted = false;
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Check if there are pending operations
   */
  get hasPending(): boolean {
    return this.queue.length > 0 || this.isProcessing;
  }
}

/**
 * Debounced async function with cancellation support
 * Ensures only the latest call executes after the delay
 */
export function createDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): {
  call: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => Promise<void>;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingArgs: Parameters<T> | null = null;
  let isExecuting = false;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
  };

  const flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    if (pendingArgs && !isExecuting) {
      const args = pendingArgs;
      pendingArgs = null;
      isExecuting = true;
      try {
        await fn(...args);
      } finally {
        isExecuting = false;
      }
    }
  };

  const call = (...args: Parameters<T>) => {
    pendingArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(async () => {
      timeoutId = null;
      if (pendingArgs && !isExecuting) {
        const currentArgs = pendingArgs;
        pendingArgs = null;
        isExecuting = true;
        try {
          await fn(...currentArgs);
        } finally {
          isExecuting = false;
        }
      }
    }, delay);
  };

  return { call, cancel, flush };
}

/**
 * Guard to ensure only one instance of an async operation runs at a time
 * Subsequent calls while executing will be queued or dropped based on config
 */
export function createAsyncGuard<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    mode: 'queue' | 'drop' | 'latest';
  } = { mode: 'drop' }
): T {
  let isExecuting = false;
  let pendingCall: { args: Parameters<T>; resolve: (v: any) => void; reject: (e: any) => void } | null = null;

  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (isExecuting) {
      if (options.mode === 'drop') {
        return Promise.resolve(undefined as ReturnType<T>);
      }
      
      if (options.mode === 'latest') {
        // Cancel previous pending and set new
        return new Promise((resolve, reject) => {
          pendingCall = { args, resolve, reject };
        });
      }
      
      // Queue mode - wait for current to finish then execute
      return new Promise((resolve, reject) => {
        const checkAndExecute = () => {
          if (!isExecuting) {
            isExecuting = true;
            fn(...args)
              .then(resolve)
              .catch(reject)
              .finally(() => {
                isExecuting = false;
              });
          } else {
            setTimeout(checkAndExecute, 50);
          }
        };
        checkAndExecute();
      });
    }

    isExecuting = true;
    try {
      const result = await fn(...args);
      return result;
    } finally {
      isExecuting = false;
      
      // Process pending call if in 'latest' mode
      if (pendingCall && options.mode === 'latest') {
        const { args: pendingArgs, resolve, reject } = pendingCall;
        pendingCall = null;
        wrapped(...pendingArgs).then(resolve).catch(reject);
      }
    }
  };

  return wrapped as T;
}
