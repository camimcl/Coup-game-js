import { Socket } from 'socket.io';
import Card from './Card.ts';
import {
  CARD_DISCARDED, CARD_DRAW, PRIVATE_PLAYER_INFO_UPDATE, REQUEST_PRIVATE_PLAYER_INFO,
} from '../../constants/events.ts';

export default class Player {
  private cards: Card[];

  private coins: number;

  public readonly name: string;

  public readonly uuid: string;

  public readonly socket: Socket;

  constructor(name: string, socket: Socket) {
    this.name = name;
    this.uuid = socket.id;
    this.socket = socket;

    this.cards = [];
    this.coins = 2;

    this.socket.on(REQUEST_PRIVATE_PLAYER_INFO, () => {
      this.socket.emit(PRIVATE_PLAYER_INFO_UPDATE, this.getPrivateProfile());
    });
  }

  public removeCardByUUID(uuid: string): Card {
    const index = this.cards.findIndex((c) => c.uuid === uuid);

    if (index < 0) {
      throw new Error(`Card with UUID ${uuid} not found in player ${this.uuid}`);
    }

    const [removed] = this.cards.splice(index, 1);

    this.socket.emit(CARD_DISCARDED, removed);

    return removed;
  }

  public addCard(card: Card): void {
    this.cards.push(card);

    this.socket.emit(CARD_DRAW, card);
  }

  public getCards(): Card[] {
    return [...this.cards];
  }

  public getCardByUUID(uuid: string): Card {
    return this.cards.find((c) => c.uuid === uuid)!;
  }

  public addCoins(amount: number): void {
    this.coins += amount;
  }

  public removeCoins(amount: number): void {
    if (amount > this.coins) {
      throw new Error(`Player ${this.uuid} cannot remove ${amount} coins; only has ${this.coins}`);
    }

    this.coins -= amount;
  }

  public getCoinsAmount(): number {
    return this.coins;
  }

  public getPublicProfile(): {
    uuid: string;
    name: string;
    coins: number;
    cardsCount: number;
    } {
    return {
      uuid: this.uuid,
      name: this.name,
      coins: this.coins,
      cardsCount: this.cards.length,
    };
  }

  public getPrivateProfile(): {
    uuid: string;
    name: string;
    coins: number;
    cards: Card[];
    } {
    return {
      uuid: this.uuid,
      name: this.name,
      coins: this.coins,
      cards: this.cards,
    };
  }

}
