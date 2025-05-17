import { CardVariant } from '../../constants/cardVariants.ts';

export default class Card {
  public readonly uuid: string;

  public readonly variant: CardVariant;

  constructor(variant: CardVariant) {
    this.uuid = crypto.randomUUID();
    this.variant = variant;
  }
}
