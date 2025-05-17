import { CardVariant } from '../../constants/cardVariants.ts';

/**
 * Represents a single game card with a unique identifier and a variant/type.
 */
export default class Card {
  /** Unique identifier for this card instance. */
  public readonly uuid: string;

  /** The card’s variant (e.g., DUKE, ASSASSIN, etc.). */
  public readonly variant: CardVariant;

  /**
   * Creates a new Card.
   *
   * @param variant - The variant/type of this card.
   */
  constructor(variant: CardVariant) {
    this.uuid = crypto.randomUUID();
    this.variant = variant;
  }

  /**
   * Compares this card to another by UUID.
   *
   * @param other - Another Card instance.
   * @returns True if both cards share the same UUID.
   */
  public equals(other: Card): boolean {
    return this.uuid === other.uuid;
  }

  /**
   * Returns a JSON-serializable representation of this card.
   *
   * @returns An object with `uuid` and `variant` properties.
   */
  public toJSON(): { uuid: string; variant: CardVariant } {
    return {
      uuid: this.uuid,
      variant: this.variant,
    };
  }
}
