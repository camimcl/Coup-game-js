import { Namespace } from 'socket.io';

/**
 * Parameters for setting up event listeners on sockets within a namespace.
 */
export interface SocketListenerOptions {
  /** Namespace whose sockets will receive the listener. */
  namespace: Namespace;
  /** Name of the event to listen for. */
  eventName: string;
  /**
   * Callback invoked when the event fires.
   * @param data     – Payload of the event.
   * @param socketId – ID of the socket that emitted the event.
   */
  callback: (data: unknown, socketId: string) => void;
  /**
   * Optional socket ID to exclude from receiving the listener.
   * If provided, that socket will be skipped.
   */
  excludeSocketId?: string;
}

/**
 * Internal helper: registers either `.on` or `.once` listeners on each socket.
 *
 * @param opts – Shared listener options.
 * @param once – If true, uses `socket.once`; otherwise uses `socket.on`.
 */
function applyListener(opts: SocketListenerOptions, once: boolean): void {
  const {
    namespace, eventName, callback, excludeSocketId,
  } = opts;

  namespace.sockets.forEach((socket) => {
    if (excludeSocketId && socket.id === excludeSocketId) return;

    const register = once ? socket.once.bind(socket) : socket.on.bind(socket);
    register(eventName, (data: unknown) => callback(data, socket.id));
  });
}

/**
 * Register a persistent listener on **all** sockets in the namespace.
 *
 * @param opts – Listener configuration.
 */
export function onEverySocketInNamespace(opts: SocketListenerOptions): void {
  applyListener(opts, false);
}

/**
 * Register a persistent listener on **all** sockets **except one**.
 *
 * @param opts – Listener configuration. Must include `excludeSocketId`.
 */
export function onEverySocketExceptOne(
  opts: SocketListenerOptions & { excludeSocketId: string },
): void {
  applyListener(opts, false);
}

/**
 * Register a one-time listener on **all** sockets in the namespace.
 *
 * @param opts – Listener configuration.
 */
export function onceEverySocketInNamespace(opts: SocketListenerOptions): void {
  applyListener(opts, true);
}

/**
 * Register a one-time listener on **all** sockets **except one**.
 *
 * @param opts – Listener configuration. Must include `excludeSocketId`.
 */
export function onceEverySocketExceptOne(
  opts: SocketListenerOptions & { excludeSocketId: string },
): void {
  applyListener(opts, true);
}
