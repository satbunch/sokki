/**
 * Debounce utility for delaying function execution.
 */

export interface DebounceOptions {
  /**
   * Time in milliseconds to wait before executing the function.
   * @default 400
   */
  wait?: number;

  /**
   * If true, invoke on leading edge of timeout.
   * @default false
   */
  leading?: boolean;

  /**
   * If true, invoke on trailing edge of timeout.
   * @default true
   */
  trailing?: boolean;
}

/**
 * Creates a debounced version of a function.
 *
 * @param func - The function to debounce
 * @param options - Configuration options (defaults: wait=400ms, leading=false, trailing=true)
 * @returns A debounced function with a `cancel` method
 *
 * @example
 * const debouncedSave = debounce((value: string) => {
 *   console.log('Saving:', value);
 * });
 *
 * debouncedSave('hello');
 * debouncedSave('hello world');
 * debouncedSave.cancel(); // Cancel pending execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  options: DebounceOptions = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const { wait = 400, leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let lastCallTime: number | null = null;

  const invokeFunc = () => {
    if (lastArgs !== null) {
      func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
    lastCallTime = null;
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = leading && lastCallTime === null;

    lastCallTime = time;
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (isInvoking) {
      invokeFunc();
    }

    timeoutId = setTimeout(() => {
      if (trailing) {
        invokeFunc();
      }
      timeoutId = null;
      lastCallTime = null;
    }, wait);
  };

  debounced.cancel = cancel;
  return debounced;
}
