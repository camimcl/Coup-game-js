import { Namespace } from 'socket.io';
import Card from './entities/Card.ts';
import Player from './entities/Player.ts';
import Deck from './entities/Deck.ts';

/**
 * Manages the full state of a match:
 */
export default class GameState {
  /** Cards selected during prompts or actions. */
  private chosenCards: Card[] = [];

  /** Index of the player whose turn it is. */
  private currentTurnPlayerIndex: number = 0;

  /** Index of the player targeted for action this turn. */
  private currentTurnTargetIndex: number = 0;

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

  /**
   * Initializes a new game state.
   *
   * @param namespace - Namespace for emitting state updates.
   * @param players   - Starting list of players.
   */
  constructor(namespace: Namespace, players: Player[]) {
    this.namespace = namespace;
    this.players = players;
    this.deck = new Deck(players.length);
    this.uuid = '123';

    this.dealInitialHands();
    this.broadcastState();
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

    if (player.getCardsClone().length === 0) {
      this.eliminatePlayer(player.uuid);
    }

    this.broadcastState();
  }

  //

  /**
   * Advances turn to the next active player (wraps around),
   * and resets the target to that player by default.
   */
  public goToNextTurn(): void {
    if (this.players.length === 0) return;

    this.currentTurnPlayerIndex = (this.currentTurnPlayerIndex + 1) % this.players.length;
    this.currentTurnTargetIndex = this.currentTurnPlayerIndex;

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
      this.broadcastState();
      return card;
    }
    return null;
  }

  //put the revealed card in the deck, shuffle, and draw a new one
  public discardRevealedCard(cardUUID: string, player: Player): void { 
    const discarded = player.removeCardByUUID(cardUUID);

    this.deck.pushAndShuffle(discarded);
    player.addCard(this.deck.draw())
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

    this.eliminatedPlayers.push(player);
    this.players = this.players.filter((p) => p.uuid !== uuid);
  }

  /**
   * Deals an initial hand to every player from the deck.
   * Assumes Deck was initialized with enough cards.
   *
   * @param handSize - Number of cards per player (default: 2).
   */
  private dealInitialHands(handSize: number = 2): void {
    this.players.forEach((player) => {
      for (let i = 0; i < handSize; i += 1) {
        const card = this.deck.draw();
        if (card) player.addCard(card);
      }
    });
  }

  /** @returns The player whose turn it is now. */
  public getCurrentTurnPlayer(): Player {
    return this.players[this.currentTurnPlayerIndex];
  }

  /** @returns The player targeted for action this turn. */
  public getCurrentTurnTarget(): Player {
    return this.players[this.currentTurnTargetIndex];
  }

  /** @returns All active players. */
  public getActivePlayers(): Player[] {
    return [...this.players];
  }

  /** @returns All eliminated players. */
  public getEliminatedPlayers(): Player[] {
    return [...this.eliminatedPlayers];
  }

  /** @returns Total number of active players. */
  public getPlayersCount(): number {
    return this.players.length;
  }

  /** @returns The current deck. */
  public getDeck(): Deck {
    return this.deck;
  }

  /**
   * Broadcasts the full game state over the namespace.
   * You can adjust which parts you want clients to see.
   */
  public broadcastState(): void {
    this.namespace.emit('GAME_STATE_UPDATE', {
      uuid: this.uuid,
      players: this.players.map((p) => p.name),
      eliminated: this.eliminatedPlayers.map((p) => p.name),
      currentTurnPlayer: this.getCurrentTurnPlayer()?.uuid,
      currentTurnTarget: this.getCurrentTurnTarget()?.uuid,
      deckSize: this.deck.size(),
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
