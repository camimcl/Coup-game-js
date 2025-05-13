import { Namespace } from 'socket.io';

/**
 * Wraps a success callback and a timeout callback into a single cancellable function.
 *
 * @typeParam T - Tuple of argument types that will be forwarded to `onSuccess`.
 *
 * @param onSuccess - Function to call if the wrapper is invoked before the timeout.
 * @param onTimeout - Function to call automatically when the timeout elapses first.
 * @param timeout   - Milliseconds to wait before firing the timeout.
 * @returns A function that, when called with arguments of type `T`, will cancel the timeout
 *          and invoke `onSuccess(...args)` exactly once.
 *
 * @example
 * ```ts
 * const retryOrFail = withTimeout<[string]>(
 *   (msg) => console.log("Got response:", msg),
 *   () => console.error("Request timed out"),
 *   3000
 * );
 *
 * // If you get a response in time:
 * retryOrFail("All good!");
 *
 * // Or if no response arrives, after 3s you'll see "Request timed out"
 * ```
 */
export default function withTimeout<T extends unknown[]>(
  onSuccess: (...args: T) => void,
  onTimeout: () => void,
  timeout: number,
): (...args: T) => void {
  let called = false;
  const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args: T): void => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess(...args);
  };
}
