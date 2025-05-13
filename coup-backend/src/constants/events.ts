// constants/events.ts

/**
 * Emit when a player performs or requests any game action.
 */
export const ACTION_PERFORMED = 'ACTION_PERFORMED';

/**
 * Emit when an assassination action is executed.
 */
export const ASSASSINATE_PERFORMED = 'ASSASSINATE_PERFORMED';

/**
 * Emit when a block action is attempted against another player's action.
 */
export const BLOCK_ACTION = 'BLOCK_ACTION';

/**
 * Emit when a block resolution occurs (action successfully blocked or passed).
 */
export const BLOCK_RESOLVED = 'BLOCK_RESOLVED';

/**
 * Used to identify when a card was chosen by a user.
 */
export const CARD_CHOSEN = 'CARD_CHOSEN';

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
 * Emit when an Ambassador exchange swaps cards.
 */
export const CARD_SWAPPED = 'CARD_SWAPPED';

/**
 * Used for general chat messages between players.
 */
export const CHAT_MESSAGE = 'CHAT_MESSAGE';

/**
 * Used when a public challenge opportunity is opened.
 */
export const CLOSE_PUBLIC_CHALLENGE = 'CLOSE_PUBLIC_CHALLENGE';

/**
 * Used when someone does an action that gives the possibility for a public challenge.
 */
export const OPEN_PUBLIC_CHALLENGE = 'OPEN_PUBLIC_CHALLENGE';

/**
 * Used when a public challenge is made against a player.
 */
export const START_PUBLIC_CHALLENGE = 'START_PUBLIC_CHALLENGE';

/**
 * Emit when a Coup action is executed.
 */
export const COUP_PERFORMED = 'COUP_PERFORMED';

/**
 * Emit when the deck is shuffled.
 */
export const DECK_SHUFFLED = 'DECK_SHUFFLED';

/**
 * Used when a player has joined a match.
 */
export const ENTER_MATCH = 'ENTER_MATCH';

/**
 * Emit when an Ambassador (exchange) action is performed.
 */
export const EXCHANGE_PERFORMED = 'EXCHANGE_PERFORMED';

/**
 * Emit when a player takes Foreign Aid.
 */
export const FOREIGN_AID_TAKEN = 'FOREIGN_AID_TAKEN';

/**
 * Used to warn that the game has ended.
 */
export const GAME_END = 'GAME_END';

/**
 * Used to reset the game state.
 */
export const GAME_RESET = 'GAME_RESET';

/**
 * Used to warn that the game is starting.
 */
export const GAME_START = 'GAME_START';

/**
 * Used to let all players know of the current game state.
 */
export const GAME_STATE_UPDATE = 'GAME_STATE_UPDATE';

/**
 * Used when a player ignores a public challenge.
 */
export const IGNORE_PUBLIC_CHALLENGE = 'IGNORE_PUBLIC_CHALLENGE';

/**
 * Used when a player leaves a match.
 */
export const LEAVE_MATCH = 'LEAVE_MATCH';

/**
 * Used to indicate an ongoing match count update.
 */
export const MATCH_CREATED = 'MATCH_CREATED';

/**
 * Used when a match is concluded.
 */
export const MATCH_ENDED = 'MATCH_ENDED';

/**
 * Used when a match starts.
 */
export const MATCH_STARTED = 'MATCH_STARTED';

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

/**
 * Emit when a Steal (Captain) action is executed.
 */
export const STEAL_PERFORMED = 'STEAL_PERFORMED';

/**
 * Emit when a Tax (Duke) action is executed.
 */
export const TAX_COLLECTED = 'TAX_COLLECTED';

/**
 * Emit when a player's turn ends.
 */
export const TURN_ENDED = 'TURN_ENDED';
