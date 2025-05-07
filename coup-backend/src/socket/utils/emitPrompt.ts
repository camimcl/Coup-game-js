import { Namespace, Socket } from 'socket.io';
import { PROMPT } from '../../constants/events.ts';

/// Variants which the client knows how to handle the prompt without options

// Used when the player has to choose one card among all the owned ones
export const OWNED_CARDS_CHOICE = 'OWNED_CARDS_CHOICE';

// Used when the player has to choose one card among a set of cards
export const CARDS_CHOICE = 'CARDS_CHOICE';

export type PROMPT_VARIANT = typeof OWNED_CARDS_CHOICE | typeof CARDS_CHOICE;

export type PromptOption = {
  label: string;
  value: string | boolean | number;
}

type TEmitPrompt = {
  socket: Socket;

  namespace: Namespace;

  // The message which will show up for the player
  message: string;

  // The options the player has. It may be undefined
  // when the client knows to handle the prompt variant
  options?: PromptOption[];

  // TODO: Implement
  // The UUIDs that will receive the event
  targets?: Socket[];

  timeout?: number;

  // The promp variant
  variant?: PROMPT_VARIANT;
}

export function emitPromptToOtherPlayers(
  {
    message,
    options,
    socket,
    variant,
  }: TEmitPrompt,
) {
  socket.broadcast.emit(PROMPT, {
    message,
    options,
    variant,
  });
}

/// socket is the target player
export function emitPromptToPlayer(
  {
    message,
    namespace,
    options,
    socket: targetSocket,
    variant,
  }: TEmitPrompt,
) {
  namespace.to(targetSocket.id).emit(PROMPT, {
    message,
    options,
    variant,
  });
}
