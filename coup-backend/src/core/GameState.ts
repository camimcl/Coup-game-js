import { Namespace } from 'socket.io';
import Card from './entities/Card.ts';
import Player from './entities/Player.ts';
import Deck from './Deck.ts';

export default class GameState {
  // Used for when the player has to choose one or more cards
  private chosen_cards: Card[];

  // Player that is making the play in the current turn
  private current_turn_player: number = 0;

  // Players that should take an action in the current turn.
  // It might not be the `current_turn_player`. For instance,
  // a second player could be asked to choose a card to discard
  // after loosing a challenge to the `current_turn_player`.
  private current_turn_target_player: number = 0;

  private deck: Deck;

  private players: Player[];

  private eliminatedPlayers: Player[];

  readonly uuid: string;

  readonly namespace: Namespace;

  constructor(
    namespace: Namespace,
    players: Player[],
  ) {
    this.chosen_cards = [];
    this.current_turn_player = 0;
    this.deck = new Deck(players.length);
    this.namespace = namespace;
    this.players = players;
    this.eliminatedPlayers = [];
    this.uuid = '123';
  }

  discardPlayerCardAndAddToDeck(cardUUID: string, player: Player) {
    const discardedCard = player.removeCardByUUID(cardUUID);

    // Player has been eliminated. Remove from the `players` array
    if (player.getCardsClone().length === 0) {
      // TODO: move the player to a `losers` array or handle the losing another way
      console.debug(`Player ${player.uuid} has lost.`);

      this.eliminatedPlayers.push(this.getPlayerByUUID(player.uuid));

      this.players = this.players.filter((_player) => _player.uuid !== player.uuid);
    }

    this.addCardToDeck(discardedCard);
  }

  goToNextTurn() {
    // TODO: we probably have to handle other things like registering logs, turns...
    this.current_turn_player += 1;

    if (this.current_turn_player === this.players.length) {
      this.current_turn_player = 0;
    }

    this.current_turn_target_player = this.current_turn_player;
  }

  addCardToDeck(card: Card) {
    this.deck.push(card);
  }

  getCurrentTurnPlayer() {
    return this.players[this.current_turn_player];
  }

  getPlayerByUUID(uuid: string) {
    return this.players.filter((player) => player.uuid === uuid)[0];
  }

  getPlayersAmount() {
    return this.players.length;
  }
}
