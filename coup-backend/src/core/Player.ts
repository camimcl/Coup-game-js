import Card from './Card';

export default class Player {
  private cards: Card[];

  coins: number;

  readonly name: string;

  readonly uuid: string;

  constructor(name: string) {
    this.cards = [];
    this.coins = 2;
    this.name = name;
    this.uuid = crypto.randomUUID();
  }

  discardCard(index: number) {
    this.cards = this.cards.filter((_, i) => i !== index);
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  getCardsClone() {
    return JSON.parse(JSON.stringify(this.cards)) as Card[];
  }
}
