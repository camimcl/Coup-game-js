/* eslint-disable no-console */
import { Namespace } from 'socket.io';
import EventEmitter from 'events';
import Card from './entities/Card.ts';
import Player from './entities/Player.ts';
import Deck from './entities/Deck.ts';
import {
  CARD_DISCARDED,
  CARD_DRAW,
  GAME_END, GAME_STATE_UPDATE, TURN_START, PLACE_CARD_INTO_DECK,
  PLAYER_ELIMINATED,
} from '../constants/events.ts';

/**
 * Manages the full state of a match:
 */
export default class GameState {
  /** Index of the player whose turn it is. */
  private currentTurnPlayerIndex: number = 0;

  /** Shared deck of cards to draw from or discard into. */
  private deck: Deck;

  private knownCards: Card[] = [];
  /** Cards that have been discarded. */

  /** Players still active in the match. */
  private players: Player[];

  /** Players who have been eliminated. */
  private eliminatedPlayers: Player[] = [];

  /** Unique match identifier (used for the Socket.IO namespace). */
  public readonly uuid: string;

  /** Socket.IO namespace for broadcasting game-state events. */
  private readonly namespace: Namespace;

  private readonly internalBus: EventEmitter;

  /**
   * Initializes a new game state.
   *
   * @param namespace - Namespace for emitting state updates.
   * @param players   - Starting list of players.
   */
  constructor(internalBus: EventEmitter, namespace: Namespace, players: Player[]) {
    this.namespace = namespace;
    this.players = players;
    this.deck = new Deck(players.length);
    this.uuid = '123';
    this.internalBus = internalBus;
  }

  /**
   * Discards a card from the given player into the deck.
   * Eliminates the player if they have no cards left.
   *
   * @param cardUUID - UUID of the card to discard.
   * @param player   - Player who is discarding.
   */
  public discardPlayerCard(cardUUID: string, player: Player): void {
    const discarded = player.removeCardByUUID(cardUUID);

    this.knownCards.push(discarded);

    player.socket.emit(CARD_DISCARDED, discarded);

    if (player.getCardsClone().length === 0) {
      this.eliminatePlayer(player.uuid);

      // Warns every one that this player has died
      // this.namespace.emit(PLAYER_DEATH, { playerId: player.uuid });
    }

    this.broadcastState();
  }

  public startGame() {
    this.dealInitialHands();

    this.broadcastState();
  }

  /**
   * Advances turn to the next active player (wraps around),
   * and resets the target to that player by default.
   */
  public goToNextTurn(): void {
    if (this.players.length === 0) return;

    if (this.players.length === 1) {
      console.debug(`${this.players[0].name} won the match`);

      // Warns internal listeners that the match is over
      this.internalBus.emit(GAME_END);

      // Warns clients that the match is over
      this.namespace.emit(GAME_END);

      return;
    }

    this.currentTurnPlayerIndex = (this.currentTurnPlayerIndex + 1) % this.players.length;

    this.internalBus.emit(TURN_START);

    this.broadcastState();
  }

  /**
   * Draws one card from the deck and gives it to the specified player.
   *
   * @param player - Player who will receive the drawn card.
   * @returns The drawn card, or null if the deck is empty.
   */

  public drawCardForPlayer(player: Player): Card | null {
    const card = this.deck.draw();

    if (card) {
      player.addCard(card);

      this.namespace.emit(
        CARD_DRAW,
        { cardUUID: card.uuid, targetPlayerUUID: player.uuid },
      );

      this.broadcastState();

      return card;
    }
    return null;
  }

  public placeCardIntoDeckAndReceiveAnother(cardUUID: string, player: Player): void {
    this.placeCardIntoDeck(player.removeCardByUUID(cardUUID));

    this.drawCardForPlayer(player);

    this.broadcastState();
  }

  public placeCardIntoDeck(card: Card): void {
    this.deck.pushAndShuffle(card);

    // Warns everyone that a card was placed into the deck
    this.namespace.emit(
      PLACE_CARD_INTO_DECK,
      { cardUUID: card.uuid, originPlayerUUID: card.uuid },
    );
  }

  /**
   * Eliminates a player by UUID, moving them to the eliminated list
   * and removing them from active players.
   *
   * @param uuid - UUID of the player to eliminate.
   */
  public eliminatePlayer(uuid: string): void {
    const [player] = this.players.filter((p) => p.uuid === uuid);

    if (!player) return;

    console.debug(`${player.name} has been eliminated`);

    const index = this.players.findIndex((p) => p.uuid === uuid);

    if (index >= this.currentTurnPlayerIndex) {
      this.currentTurnPlayerIndex -= 1;
    }

    this.eliminatedPlayers.push(this.players.splice(index, 1)[0]);

    // Warns everyone that this player has been eliminated
    // TODO: send who killed that player?

    this.namespace.emit(
      PLAYER_ELIMINATED,
      { playerUUID: uuid },
    );

    this.broadcastState();
  }

  // TODO: I guess we should not return the cards to the deck
  removePlayer(uuid: string) {
    const index = this.players.findIndex((p) => p.uuid === uuid);

    const removedPlayer = this.players.splice(index, 1);

    removedPlayer[0]?.getCardsClone().forEach((card) => this.deck.push(card));

    // If the current player is leaving the match,
    // start a new turn
    if (index === this.currentTurnPlayerIndex) {
      // We need to go back one index so the method
      // this.goToNextTurn() sets the right value to it
      this.currentTurnPlayerIndex -= 1;

      this.goToNextTurn();
    } else {
      this.broadcastState();
    }
  }

  /**
   * Deals an initial hand to every player from the deck.
   * Assumes Deck was initialized with enough cards.
   *
   * @param handSize - Number of cards per player (default: 2).
   */
  private dealInitialHands(handSize: number = 2): void {
    const totalCardsNeeded = this.players.length * handSize;

    if (this.deck.size() < totalCardsNeeded) {
      throw new Error('Not enough cards in the deck to deal initial hands.');
    }

    this.players.forEach((player) => {
      this.drawCardForPlayer(player);
      this.drawCardForPlayer(player);
    });

    this.broadcastState();
  }

  /** @returns The player whose turn it is now. */
  public getCurrentTurnPlayer(): Player {
    return this.players[this.currentTurnPlayerIndex];
  }

  /** @returns All active players. */
  public getActivePlayers(): Player[] {
    return [...this.players];
  }

  /** @returns Total number of active players. */
  public getPlayersCount(): number {
    return this.players.length;
  }

  /**
   * Broadcasts the full game state over the namespace.
   */
  public broadcastState(): void {
    this.namespace.emit(GAME_STATE_UPDATE, {
      uuid: this.uuid,
      players: this.players.map((p) => p.publicProfile()),
      eliminated: this.eliminatedPlayers.map((p) => p.publicProfile()),
      currentTurnPlayer: this.getCurrentTurnPlayer()?.uuid,
      deckSize: this.deck.size(),
      knownCards: this.knownCards,
    });
  }

  /** @returns The match namespace. */
  public getNamespace() {
    return this.namespace;
  }

  /** @returns Returns the player with UUID. */
  public getPlayerByUUID(uuid: string) {
    return this.players.filter((player) => player.uuid === uuid)[0];
  }
}
