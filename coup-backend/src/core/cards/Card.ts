import { CardVariant } from './CardVariants';
import Deck from './Deck';
import Player from './Player';

export default class Card {
  // If there is no owner, the card belongs to the deck
  owner: Player | Deck;

  readonly uuid: string;

  readonly variant: CardVariant;

  constructor(owner: Player | Deck, variant: CardVariant) {
    this.owner = owner;
    this.uuid = crypto.randomUUID();
    this.variant = variant;
  }
}
