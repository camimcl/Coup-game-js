/**
 * Used to let everyone know that a player is discarding a card.
 */
export const CARD_DISCARDED = 'CARD_DISCARDED';

/**
 * Used to let everyone know that a player is drawing a card.
 */
export const CARD_DRAW = 'CARD_DRAW';

/**
 * Emit when a hidden card is revealed (after challenge or reveal).
 */
export const CARD_REVEALED = 'CARD_REVEALED';

/**
 * Emit when a Coup action is executed.
 */
export const COUP_PERFORMED = 'COUP_PERFORMED';

/**
 * Used to warn that the game has ended.
 */
export const GAME_END = 'GAME_END';

/**
 * Used to warn that the game is starting.
 */
export const GAME_START = 'GAME_START';

/**
 * Used to let all players know of the current game state.
 */
export const GAME_STATE_UPDATE = 'GAME_STATE_UPDATE';

/**
 * Used to send a general message to a player.
 */
export const MESSAGE = 'MESSAGE';

/**
 * Used to warn that the next turn is starting.
 */
export const TURN_START = 'TURN_START';

/**
 * Used when a card is placed back into the deck.
 */
export const PLACE_CARD_INTO_DECK = 'PLACE_CARD_INTO_DECK';

/**
 * Used to let everyone know that a player's count changed.
 */
export const PLAYER_COUNT_UPDATE = 'PLAYER_COUNT_UPDATE';

/**
 * Used to warn everyone that a player was eliminated.
 */
export const PLAYER_ELIMINATED = 'PLAYER_ELIMINATED';

/**
 * Used to identify prompts that the user must choose an option from.
 */
export const PROMPT = 'PROMPT';

/**
 * Used to identify the answer of a prompt.
 */
export const PROMPT_RESPONSE = 'PROMPT_RESPONSE';

export const MATCH_STATE_UPDATE = 'MATCH_STATE_UPDATE';

export const REQUEST_PRIVATE_PLAYER_INFO = 'REQUEST_PRIVATE_PLAYER_INFO';

export const PRIVATE_PLAYER_INFO_UPDATE = 'PRIVATE_PLAYER_INFO_UPDATE';
