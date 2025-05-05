import { Namespace } from 'socket.io';
import { PROMPT } from './events';

/// Variants which the client knows how to handle without options

// Used when the player has to choose one card among all the owned ones
export const OWNED_CARDS_CHOICE = 'OWNED_CARDS_CHOICE';

// Used when the player has to choose one card among a set of cards
export const CARDS_CHOICE = 'CARDS_CHOICE';

export type PROMPT_VARIANT = typeof OWNED_CARDS_CHOICE | typeof CARDS_CHOICE;

interface TEmitPrompt {
  namespaceServer: Namespace;
  // The message which will show up for the player
  message: string;

  // The options the player has. It may be undefined
  // when the client knows to handle the prompt variant
  options?: string[];

  // The events corresponding to each action
  optionsEvents?: string[];

  // TODO: Implement
  // The UUIDs that will receive the event
  targetUUIDs?: string[];

  // The promp variant
  variant?: PROMPT_VARIANT;
}

export default function emitPrompt(
  {
    namespaceServer,
    message,
    options,
    optionsEvents,
    variant,
  }: TEmitPrompt,
) {
  namespaceServer.emit(PROMPT, {
    message,
    options,
    optionsEvents,
    variant,
  });
}
