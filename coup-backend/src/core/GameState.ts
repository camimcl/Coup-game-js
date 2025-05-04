import Card from './Card';
import Player from './Player';

export default class GameState {
  // Used for when the player has to choose which cards to keep
  chosen_cards: Card[];

  current_player_idx: number = 0;

  // Used for when the player has to choose which cards to discard
  discarded_cards: Card[];

  readonly players: Player[];

  shown_card: Card | null;

  readonly uuid: string;

  constructor(
    players: Player[],
  ) {
    this.chosen_cards = [];
    this.current_player_idx = 0;
    this.discarded_cards = [];
    this.players = players;
    this.shown_card = null;
    this.uuid = '123';
  }

  nextTurn() {
    // TODO: we probably have to handle other things like registering logs, turns...
    this.current_player_idx += 1;
  }

  getCurrentPlayer() {
    return this.players[this.current_player_idx];
  }
}
