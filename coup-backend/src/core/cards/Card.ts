import { CardVariant } from './CardVariants';

export default class Card {
  // If there is no owner, the card belongs to the deck
  ownerUUID: string | null;

  readonly uuid: string;

  readonly variant: CardVariant;

  constructor(ownerUUID: string | null, variant: CardVariant) {
    this.ownerUUID = ownerUUID;
    this.uuid = crypto.randomUUID();
    this.variant = variant;
  }
}
