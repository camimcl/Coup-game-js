import {
  CARD_VARIANT_AMBASSADOR,
  CARD_VARIANT_ASSASSIN,
  CARD_VARIANT_CAPTAIN,
  CARD_VARIANT_CONDESSA,
  CARD_VARIANT_DUKE,
  CardVariant,
} from '../../constants/cardVariants.ts';
import Card from './Card.ts';

const CARD_VARIANTS: CardVariant[] = [
  CARD_VARIANT_AMBASSADOR,
  CARD_VARIANT_ASSASSIN,
  CARD_VARIANT_CAPTAIN,
  CARD_VARIANT_DUKE,
  CARD_VARIANT_CONDESSA,
];

export default class Deck {
  private cards: Card[] = [];

  constructor(playersAmount: number) {
    const copiesPerVariant = playersAmount <= 5 ? 3 : 4;

    this.cards = [];

    CARD_VARIANTS.forEach((cardVariant) => {
      for (let i = 0; i < copiesPerVariant; i += 1) {
        this.cards.push(new Card(cardVariant));
      }
    });

    this.shuffle();
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

  public draw(): Card {
    const card = this.cards.shift();

    if (!card) throw new Error('No cards left in the deck');

    return card;
  }

  public pushAndShuffle(card: Card): void {
    this.cards.push(card);

    this.shuffle();
  }

  public size(): number {
    return this.cards.length;
  }
}
