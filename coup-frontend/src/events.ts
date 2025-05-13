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

// Used to warn that the next turn is starting
export const NEXT_TURN = 'NEXT_TURN';

// Used to warn that the game is starting
export const GAME_START = 'GAME_START';

// Used to warn that the game has ended
export const GAME_END = 'GAME_END';

// Used to send a general message to a player
export const MESSAGE = 'MESSAGE';

// Used to let all players know of the current game state
export const GAME_STATE_UPDATE = 'GAME_STATE_UPDATE';

// Used to let everyone know that a player has lost a card
export const OWNED_CARD_DISCARDED = 'OWNED_CARD_DISCARDED';

// Used to warn everyone that a player has died
export const PLAYER_DEATH = 'PLAYER_DEATH';

// Used to let everyone know that a player is drawing a card
export const CARD_DRAW = 'CARD_DRAW';

// Used to let everyone know that a player is discarding a card
export const CARD_DISCARDED = 'CARD_DISCARDED';

// Used to let everyone know that a player is placing a card into the deck
export const PLACE_CARD_INTO_DECK = 'PLACE_CARD_INTO_DECK';
