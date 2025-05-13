import { Namespace, Socket } from 'socket.io';
import { PROMPT, PROMPT_RESPONSE } from '../constants/events.ts';
import Player from '../core/entities/Player.ts';

/**
 * Variants for which the client knows how to handle the prompt without options.
 *
 * - `OWNED_CARDS_CHOICE`: Player chooses one card among all owned cards.
 * - `CARDS_CHOICE`: Player chooses one card among a specific set of cards.
 */
export const OWNED_CARDS_CHOICE = 'OWNED_CARDS_CHOICE';
export const OWNED_CARDS_CHOICE_MULTIPLE = 'OWNED_CARDS_CHOICE_MULTIPLE';
export const CARDS_CHOICE = 'CARDS_CHOICE';

/** Union type of all supported prompt variants. */
export type PROMPT_VARIANT =
  typeof OWNED_CARDS_CHOICE |
  typeof CARDS_CHOICE |
  typeof OWNED_CARDS_CHOICE_MULTIPLE;

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

export async function askPlayerToChooseTwoCards(
  namespace: Namespace,
  player: Player,
): Promise<[string, string]> {
  const cards = player.getCardsClone();
  const options = cards.map((card) => ({
    label: card.variant,
    value: card.uuid,
  }));

  emitPromptToPlayer({
    namespace,
    socket: player.socket,
    message: 'Escolha 2 cartas',
    options,
    variant: OWNED_CARDS_CHOICE_MULTIPLE,
  });

  return new Promise<[string, string]>((resolve) => {
    const timeoutId = setTimeout(() => {
      console.debug('Prompt expirado. Selecionando automaticamente as duas primeiras cartas.');

      resolve([options[0].value, options[1].value]);
    }, 7000);

    player.socket.once(PROMPT_RESPONSE, (response) => {
      clearTimeout(timeoutId);

      if (Array.isArray(response) && response.length >= 2) {
        resolve(response as [string, string]);
      } else {
        resolve([options[0].value, options[1].value]);
      }
    });
  });
}

/// Ask a player to choose a card among the cards their own.
/// If timeout is passed and a card is not chosen, the first
/// card is chosen
/// @Returns the uuid of the chosen card
export default async function askPlayerToChooseCard(
  namespace: Namespace,
  player: Player,
  variant?: PROMPT_VARIANT,
) {
  const options = player.getCardsClone().map((card) => ({ label: card.variant, value: card.uuid }));

  emitPromptToPlayer({
    namespace,
    socket: player.socket,
    message: 'Escolha uma das cartas',
    options,
    variant,
  });

  return new Promise<string>((resolve) => {
    const timeoutId = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.debug('Prompt to choose card has timed out');

      resolve(options[0].value);
    }, 15000);

    player.socket.on(PROMPT_RESPONSE, (response) => {
      clearTimeout(timeoutId);

      resolve(response);
    });
  });
}
