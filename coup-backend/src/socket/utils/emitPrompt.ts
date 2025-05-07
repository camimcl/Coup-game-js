import { Namespace, Socket } from 'socket.io';
import { PROMPT } from '../../constants/events.ts';

/**
 * Variants for which the client knows how to handle the prompt without options.
 *
 * - `OWNED_CARDS_CHOICE`: Player chooses one card among all owned cards.
 * - `CARDS_CHOICE`: Player chooses one card among a specific set of cards.
 */
export const OWNED_CARDS_CHOICE = 'OWNED_CARDS_CHOICE';
export const CARDS_CHOICE = 'CARDS_CHOICE';

/** Union type of all supported prompt variants. */
export type PROMPT_VARIANT = typeof OWNED_CARDS_CHOICE | typeof CARDS_CHOICE;

/**
 * Represents an option in a prompt presented to the player.
 */
export type PromptOption = {
  /** Label displayed to the user. */
  label: string;
  /** Underlying value returned when selected. */
  value: string | boolean | number;
};

/**
 * Parameters for emitting a prompt via Socket.IO.
 */
type TEmitPrompt = {
  /** Sender’s socket (or the socket to target). */
  socket: Socket;
  /** Namespace to route the prompt (for targeting a specific socket). */
  namespace: Namespace;
  /** Message text to display in the prompt. */
  message: string;
  /** Optional choices for the player. */
  options: PromptOption[];
  /** TODO: Implement multicast via explicit target sockets. */
  targets?: Socket[];
  /** Optional timeout (ms) after which a default action may be taken. */
  timeout?: number;
  /** Variant guiding how the client should render/interpret the prompt. */
  variant?: PROMPT_VARIANT;
};

/**
 * Emit a prompt to *all other* players except the sender.
 *
 * @param param0 - Destructured prompt parameters.
 * @param param0.socket  - Sender’s socket; the broadcast excludes this socket.
 * @param param0.message - Prompt message to display.
 * @param param0.options - Array of choices for the prompt.
 * @param param0.variant - Variant indicating client-side handling.
 */
export function emitPromptToOtherPlayers({
  message,
  options,
  socket,
  variant,
}: TEmitPrompt): void {
  socket.broadcast.emit(PROMPT, {
    message,
    options,
    variant,
  });
}

/**
 * Emit a prompt to a *specific* player.
 *
 * @param param0 - Destructured prompt parameters.
 * @param param0.namespace   - Namespace used to target the specific socket.
 * @param param0.socket      - Target player’s socket.
 * @param param0.message     - Prompt message to display.
 * @param param0.options     - Array of choices for the prompt.
 * @param param0.variant     - Variant indicating client-side handling.
 */
export function emitPromptToPlayer({
  message,
  namespace,
  options,
  socket: targetSocket,
  variant,
}: TEmitPrompt): void {
  namespace.to(targetSocket.id).emit(PROMPT, {
    message,
    options,
    variant,
  });
}
