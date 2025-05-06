// Used when someone do an action that gives the possibility to any other player challenge it
export const OPEN_PUBLIC_CHALLENGE = 'OPEN_PUBLIC_CHALLENGE';

// Used when a public challenge is made against a player.
export const START_PUBLIC_CHALLENGE = 'START_PUBLIC_CHALLENGE';

// Used when a player ignores a public challenge.
export const IGNORE_PUBLIC_CHALLENGE = 'IGNORE_PUBLIC_CHALLENGE';

// Used when a public challenge is closed. That is, an action cannot be contested anymore
export const CLOSE_PUBLIC_CHALLENGE = 'CLOSE_PUBLIC_CHALLENGE';

// Used to identify when a card was chosen by a user
export const CARD_CHOSEN = 'CARD_CHOSEN';

// Used to identify prompts that the user must choose an option from
export const PROMPT = 'PROMPT';

// Used to identify the answer of a prompt
export const PROMPT_RESPONSE = 'PROMPT_RESPONSE';

// Used when a player has joined a match
export const ENTER_MATCH = 'ENTER_MATCH';

// Used when a player leaves a match
export const LEAVE_MATCH = 'LEAVE_MATCH';
