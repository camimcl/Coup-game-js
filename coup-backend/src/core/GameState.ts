import Card from './cards/Card';
import Player from './Player';

export default class GameState {
  // Used for when the player has to choose one or more cards
  chosen_cards: Card[];

  // Player that is making the play in the current turn
  current_turn_player: number = 0;

  // Players that should take an action in the current turn.
  // It might not be the `current_turn_player`. For instance,
  // a second player could be asked to choose a card to discard
  // after loosing a challenge to the `current_turn_player`.
  current_turn_target_player: number = 0;

  readonly players: Player[];

  readonly uuid: string;

  constructor(
    players: Player[],
  ) {
    this.chosen_cards = [];
    this.current_turn_player = 0;
    this.players = players;
    this.uuid = '123';
  }

  nextTurn() {
    // TODO: we probably have to handle other things like registering logs, turns...
    this.current_turn_player += 1;
  }

  getCurrentPlayer() {
    return this.players[this.current_turn_player];
  }

  addPlayer(player: Player) {
    // TODO: checar se a partida ja comecou. Se sim, ninguem mais pode entrar
    this.players.push(player);
  }

  getCurrentTurnTargetPlayer(){
    return this.players[this.current_turn_target_player];
  }
}
