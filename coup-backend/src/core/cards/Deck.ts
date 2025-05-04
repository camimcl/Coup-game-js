export default class Deck {
  private cards: Card[];

  readonly uuid: string;

  constructor() {
    // Implement cards initialization based on the ammount of players and card variants
    this.cards = [];
    this.uuid = crypto.randomUUID();
  }
}
