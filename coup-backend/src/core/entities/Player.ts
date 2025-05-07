import { Socket } from 'socket.io';
import Card from './Card.ts';
import { CARD_VARIANT_DUKE, CARD_VARIANT_EMBASSADOR } from '../../constants/cardVariants.ts';

export default class Player {
  private cards: Card[];

  private coins: number;

  readonly name: string;

  readonly uuid: string;

  public readonly socket: Socket;

  constructor(name: string, socket: Socket) {
    this.name = name;
    this.uuid = socket.id;
    this.cards = [new Card(CARD_VARIANT_DUKE)];
    this.coins = 2;
    this.socket = socket;
  }

  removeCardByUUID(uuid: string) {
    const cardIndex = this.cards.findIndex((card) => card.uuid === uuid);

    const removedCard = this.cards[cardIndex];

    this.cards.splice(cardIndex, 1);

    return removedCard;
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  getCardsClone() {
    return JSON.parse(JSON.stringify(this.cards)) as Card[];
  }

  getCardByUUID(uuid: string) {
    return this.cards.filter((card) => card.uuid === uuid)[0];
  }

  addCoins(amount: number) {
    this.coins += amount;
  }

  removeCoins(amount: number) {
    this.coins -= amount;
  }

  getCoinsAmount() {
    return this.coins;
  }
}
