import Card from './entities/Card.ts';

export default class Deck {
  private cards: Card[] = [];

  constructor(playersAmount: number) {
    // TODO: implement the logic to create a deck
    this.cards = [];
  }

  /// https://stackoverflow.com/a/2450976/14209524
  shuffle() {
    let currentIndex = this.cards.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);

      currentIndex -= 1;

      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex], this.cards[currentIndex]];
    }
  }

  placeCardIntoDeckAndShuffle(cards: Card[]) {
    this.cards = this.cards.concat(cards);

    this.shuffle();
  }
}
