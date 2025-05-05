import { Socket } from 'socket.io';
import Card from './cards/Card';
import { CARD_VARIANT_EMBASSADOR } from './cards/CardVariants';

export default class Player {
  private cards: Card[];

  coins: number;

  readonly name: string;

  readonly uuid: string;

  public socket: Socket;

  constructor(name: string, socket: Socket) {
    this.name = name;
    this.uuid = crypto.randomUUID();
    this.cards = [new Card(this.uuid, CARD_VARIANT_EMBASSADOR)];
    this.coins = 2;
    this.socket = socket;
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
