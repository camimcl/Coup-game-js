/* eslint-disable no-console */
import { Namespace } from 'socket.io';
import EventEmitter from 'events';
import Card from './entities/Card.ts';
import Player from './entities/Player.ts';
import Deck from './entities/Deck.ts';
import {
  CARD_DISCARDED,
  CARD_DRAW,
  GAME_END, GAME_STATE_UPDATE, TURN_START, PLACE_CARD_INTO_DECK,
  PLAYER_ELIMINATED,
  LOG,
} from '../constants/events.ts';

export default class GameState {
  private currentTurnPlayerIndex: number = 0;

  private deck: Deck;

  private knownCards: Card[] = [];

  private players: Player[];

  private eliminatedPlayers: Player[] = [];

  public readonly uuid: string;

  private readonly namespace: Namespace;

  private readonly internalBus: EventEmitter;

  constructor(internalBus: EventEmitter, namespace: Namespace, players: Player[]) {
    this.namespace = namespace;
    this.players = players;
    this.deck = new Deck(players.length);
    this.uuid = '123';
    this.internalBus = internalBus;
  }

  public discardPlayerCard(cardUUID: string, player: Player): void {
    const discarded = player.removeCardByUUID(cardUUID);

    this.knownCards.push(discarded);

    player.socket.emit(CARD_DISCARDED, discarded);

    if (player.getCards().length === 0) {
      this.eliminatePlayer(player.uuid);
    }

    this.broadcastState();
  }

  public startGame() {
    this.dealInitialHands();

    this.broadcastState();

    this.namespace.emit(LOG, 'Iniciando partida.');
  }

  public goToNextTurn(): void {
    if (this.players.length === 0) return;

    if (this.players.length === 1) {
      console.debug(`${this.players[0].name} won the match`);

      // Warns internal listeners that the match is over
      this.internalBus.emit(GAME_END);

      // Warns clients that the match is over
      this.namespace.emit(GAME_END);

      return;
    }

    this.currentTurnPlayerIndex = (this.currentTurnPlayerIndex + 1) % this.players.length;

    this.internalBus.emit(TURN_START);

    this.namespace.emit(TURN_START);

    this.broadcastState();

    this.namespace.emit(LOG, 'Iniciando turno.');
  }

  public drawCardForPlayer(player: Player): Card | null {
    const card = this.deck.draw();

    if (card) {
      player.addCard(card);

      this.namespace.emit(
        CARD_DRAW,
        { cardUUID: card.uuid, targetPlayerUUID: player.uuid },
      );

      this.broadcastState();

      this.namespace.emit(LOG, `${player.name} recebeu uma carta.`);

      return card;
    }

    return null;
  }

  public placeCardIntoDeckAndReceiveAnother(cardUUID: string, player: Player): void {
    this.namespace.emit(LOG, `${player.name} descartou a carta revelada.`);

    this.placeCardIntoDeck(player.removeCardByUUID(cardUUID));

    this.drawCardForPlayer(player);

    this.broadcastState();
  }

  public placeCardIntoDeck(card: Card): void {
    this.deck.pushAndShuffle(card);

    // Warns everyone that a card was placed into the deck
    this.namespace.emit(
      PLACE_CARD_INTO_DECK,
      { cardUUID: card.uuid, originPlayerUUID: card.uuid },
    );
  }

  public eliminatePlayer(uuid: string): void {
    const [player] = this.players.filter((p) => p.uuid === uuid);

    if (!player) return;

    console.debug(`${player.name} has been eliminated`);

    this.namespace.emit(LOG, `${player.name} foi eliminado.`);

    const index = this.players.findIndex((p) => p.uuid === uuid);

    this.currentTurnPlayerIndex -= 1;

    this.eliminatedPlayers.push(this.players.splice(index, 1)[0]);

    // Warns everyone that this player has been eliminated
    // TODO: send who killed that player?

    this.namespace.emit(
      PLAYER_ELIMINATED,
      { playerUUID: uuid },
    );

    this.broadcastState();
  }

  // TODO: I guess we should not return the cards to the deck
  removePlayer(uuid: string) {
    const index = this.players.findIndex((p) => p.uuid === uuid);

    const removedPlayer = this.players.splice(index, 1)[0];

    this.namespace.emit(LOG, `${removedPlayer.name} saiu da partida.`);
    // removedPlayer?.getCards().forEach((card) => this.deck.pushAndShuffle(card));

    if (index === this.currentTurnPlayerIndex) {
      // We need to go back one index so the method
      // this.goToNextTurn() sets the right value to it
      this.currentTurnPlayerIndex -= 1;

      this.goToNextTurn();
    } else {
      this.broadcastState();
    }
  }

  private dealInitialHands(handSize: number = 2): void {
    this.namespace.emit(LOG, 'Distribuindo cartas iniciais.');

    const totalCardsNeeded = this.players.length * handSize;

    if (this.deck.size() < totalCardsNeeded) {
      throw new Error('Not enough cards in the deck to deal initial hands.');
    }

    this.players.forEach((player) => {
      this.drawCardForPlayer(player);
      this.drawCardForPlayer(player);
    });

    this.broadcastState();
  }

  public getCurrentTurnPlayer(): Player {
    return this.players[this.currentTurnPlayerIndex];
  }

  public getActivePlayers(): Player[] {
    return [...this.players];
  }

  public broadcastState(): void {
    this.namespace.emit(GAME_STATE_UPDATE, {
      uuid: this.uuid,
      players: this.players.map((p) => p.getPublicProfile()),
      eliminatedPlayers: this.eliminatedPlayers.map((p) => p.getPublicProfile()),
      currentTurnPlayer: this.getCurrentTurnPlayer()?.uuid,
      deckSize: this.deck.size(),
      knownCards: this.knownCards,
    });
  }

  public getNamespace() {
    return this.namespace;
  }

  public getPlayerByUUID(uuid: string) {
    return this.players.filter((player) => player.uuid === uuid)[0];
  }
}
