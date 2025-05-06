import { CardVariant } from '../../constants/cardVariants.ts';

export default class Card {
  readonly uuid: string;

  readonly variant: CardVariant;

  constructor(variant: CardVariant) {
    this.uuid = crypto.randomUUID();
    this.variant = variant;
  }
}
