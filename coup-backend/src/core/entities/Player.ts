import { Socket } from 'socket.io';
import Card from './Card.ts';
import {
  CARD_VARIANT_DUKE,
} from '../../constants/cardVariants.ts';

/**
 * Represents a player in the game, holding cards, coins, and a socket connection.
 */
export default class Player {
  /** Current cards held by the player. */
  private cards: Card[];

  /** Current coin balance of the player. */
  private coins: number;

  /** Display name of the player. */
  public readonly name: string;

  /** Unique identifier for the player (same as socket.id). */
  public readonly uuid: string;

  /** Socket.IO socket through which the player is connected. */
  public readonly socket: Socket;

  /**
   * Creates a new Player.
   *
   * @param name   - Display name.
   * @param socket - Socket.IO connection for this player.
   */
  constructor(name: string, socket: Socket) {
    this.name = name;
    this.uuid = socket.id;
    this.socket = socket;

    // Start with one Duke card and 2 coins
    this.cards = [new Card(CARD_VARIANT_DUKE)];
    this.coins = 4;
  }

  /**
   * Removes a card by its UUID from the player's hand.
   *
   * @param uuid - UUID of the card to remove.
   * @returns The removed Card.
   * @throws If no card with the given UUID is found.
   */
  public removeCardByUUID(uuid: string): Card {
    const index = this.cards.findIndex((c) => c.uuid === uuid);

    if (index < 0) {
      throw new Error(`Card with UUID ${uuid} not found in player ${this.uuid}`);
    }

    const [removed] = this.cards.splice(index, 1);

    return removed;
  }

  /**
   * Adds a card to the player's hand.
   *
   * @param card - Card to add.
   */
  public addCard(card: Card): void {
    this.cards.push(card);
  }

  /**
   * Gets a deep clone of the player's cards.
   *
   * @returns A cloned array of Card objects.
   */
  public getCardsClone(): Card[] {
    // Assuming Card is JSON-serializable; otherwise adjust cloning
    return JSON.parse(JSON.stringify(this.cards)) as Card[];
  }

  /**
   * Finds a card in the player's hand by UUID.
   *
   * @param uuid - UUID of the desired card.
   * @returns The matching Card, or undefined if not found.
   */
  public getCardByUUID(uuid: string): Card | undefined {
    return this.cards.find((c) => c.uuid === uuid);
  }

  /**
   * Increases the player's coin balance.
   *
   * @param amount - Number of coins to add.
   */
  public addCoins(amount: number): void {
    this.coins += amount;
  }

  /**
   * Decreases the player's coin balance.
   *
   * @param amount - Number of coins to remove.
   * @throws If removing more coins than the player has.
   */
  public removeCoins(amount: number): void {
    if (amount > this.coins) {
      throw new Error(`Player ${this.uuid} cannot remove ${amount} coins; only has ${this.coins}`);
    }

    this.coins -= amount;
  }

  /**
   * Gets the player's current coin balance.
   *
   * @returns Number of coins the player has.
   */
  public getCoinsAmount(): number {
    return this.coins;
  }

  /**
   * Returns a public-facing summary of this player, suitable for broadcasting.
   *
   * @returns An object containing UUID, name, coin count, and number of cards.
   */
  public publicProfile(): {
    uuid: string;
    name: string;
    coins: number;
    cardsCount: number;
    } {
    return {
      uuid: this.uuid,
      name: this.name,
      coins: this.coins,
      cardsCount: this.cards.length,
    };
  }
}
