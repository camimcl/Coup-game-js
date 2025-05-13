import { CARD_VARIANT_AMBASSADOR, CARD_VARIANT_ASSASSIN, CARD_VARIANT_CAPTAIN, CARD_VARIANT_CONDESSA, CARD_VARIANT_DUKE, CardVariant } from '../../constants/cardVariants.ts';
import Card from './Card.ts';

/**
 * A standard deck of cards supporting shuffle, draw, and insertion operations.
 */
export default class Deck {
  /** Internal array storing the cards in the deck. */
  private cards: Card[] = [];
  playersAmount: number;

  /**
   * Constructs a new deck.
   *
   * @param playersAmount - Number of players (use to determine initial card distribution).
   *                         TODO: implement logic to populate `this.cards` based on this.
   */
  constructor(playersAmount: number) {
    this.playersAmount = playersAmount;
    this.initialize();
  } 

  //initializes the deck with the correct number of each card type
  public initialize():void{
    const variants : CardVariant[] = [
      CARD_VARIANT_AMBASSADOR,
      CARD_VARIANT_ASSASSIN,
      CARD_VARIANT_CAPTAIN,
      CARD_VARIANT_DUKE,
      CARD_VARIANT_CONDESSA,
    ];
    const copiesPerVariant = this.playersAmount <= 5 ? 3 : 4;
    this.cards = [];

    for(const variant of variants){
      for(let i = 0; i < copiesPerVariant; i++){
        this.cards.push(new Card(variant));
      }
  }
    this.shuffle();
}

  /**
   * Shuffles the deck in place using the Fisher–Yates algorithm.
   */
  public shuffle(): void {
    let currentIndex = this.cards.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
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
  public draw(): Card {
    const card = this.cards.shift();
    if (!card) throw new Error('No cards left in the deck');
    return card;
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
