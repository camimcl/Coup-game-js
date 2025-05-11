import { CARD_VARIANT_AMBASSADOR, CARD_VARIANT_CONDESSA, CARD_VARIANT_DUKE } from '../../constants/cardVariants.ts';
import Card from './Card.ts';

/**
 * A standard deck of cards supporting shuffle, draw, and insertion operations.
 */
export default class Deck {
  /** Internal array storing the cards in the deck. */
  private cards: Card[] = [];

  /**
   * Constructs a new deck.
   *
   * @param playersAmount - Number of players (use to determine initial card distribution).
   *                         TODO: implement logic to populate `this.cards` based on this.
   */
  constructor(playersAmount: number) {
    // TODO: populate `this.cards` here (e.g., generate one card per combination of suit/rank)
    this.cards = [new Card(CARD_VARIANT_DUKE), new Card(CARD_VARIANT_AMBASSADOR), new Card(CARD_VARIANT_CONDESSA)]; // Example cards
  }

  /**
   * Shuffles the deck in place using the Fisher–Yates algorithm.
   */
  public shuffle(): void {
    let currentIndex = this.cards.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex],
        this.cards[currentIndex],
      ];
    }
  }

  /**
   * Draws (removes and returns) the top card of the deck.
   *
   * @returns The drawn Card, or `null` if the deck is empty.
   */
  public draw(): Card{
    return this.cards.shift()!;
  }

  /**
   * Adds a single card to deck and shuffles it.
   *
   * @param card - The Card to add.
   */
  public pushAndShuffle(card: Card): void {
    this.cards.push(card);
    this.shuffle();
  }

  /**
   * Adds a single card to the bottom of the deck.
   *
   * @param card - The Card to add.
   */
  public push(card: Card): void {
    this.cards.push(card);
  }

  /**
   * Adds multiple cards into the deck and then shuffles.
   *
   * @param newCards - Array of Cards to insert.
   */
  public placeCardIntoDeckAndShuffle(newCards: Card[]): void {
    this.cards = this.cards.concat(newCards);
    this.shuffle();
  }

  /**
   * @returns The current number of cards remaining in the deck.
   */
  public size(): number {
    return this.cards.length;
  }
}
