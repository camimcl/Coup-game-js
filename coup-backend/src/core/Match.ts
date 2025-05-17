/* eslint-disable no-console */
import { Namespace, Server } from 'socket.io';
import EventEmitter from 'events';
import Player from './entities/Player.ts';
import GameState from './GameState.ts';
import { GAME_START, MATCH_STATE_UPDATE, PLAYER_COUNT_UPDATE } from '../constants/events.ts';

const MINIMUM_NUMBER_OF_PLAYERS = 4;
const MAXIMUM_NUMBER_OF_PLAYERS = 8;

export default class Match {
  private uuid: string;

  private players: Player[];

  private hasEnded: boolean = false;

  private inProgress: boolean = false;

  private winner: Player | null = null;

  private hostUUID: string;

  private gameState: GameState;

  /** Socket.IO namespace dedicated to this match. */
  private namespace: Namespace;

  readonly internalBus: EventEmitter;

  constructor(internalBus: EventEmitter, players: Player[], server: Server) {
    this.players = players;
    this.uuid = '123'; // TODO: replace with real UUID generation
    this.namespace = server.of(this.uuid);
    this.hostUUID = players[0]?.uuid || '';
    this.internalBus = internalBus;
    this.gameState = new GameState(internalBus, this.namespace, this.players);
  }

  public startMatch() {
    if (this.inProgress) {
      console.debug(`Match ${this.uuid} is already is progress`);

      return;
    }

    if (this.players.length < MINIMUM_NUMBER_OF_PLAYERS) {
      console.debug(`Cannot start match ${this.uuid}: not enough players`);

      return;
    }

    console.debug(`Starting match ${this.uuid}`);

    this.gameState.startGame();

    this.inProgress = true;

    this.internalBus.emit(GAME_START);

    this.namespace.emit(GAME_START);

    this.emitMatchState();
  }

  addPlayer(player: Player) {
    // TODO: send events to the client saying it's not possible to join this match
    if (this.hasEnded) {
      console.warn('Cannot add player: match has already ended.');
    }

    if (this.inProgress) {
      console.warn('Cannot add player: match is already in progress. No new players allowed.');
    }

    this.players.push(player);
    this.hostUUID = this.players[0].uuid;

    this.gameState.broadcastState();
    this.namespace.emit(PLAYER_COUNT_UPDATE, this.players.length);

    this.emitMatchState();
  }

  removePlayer(uuid: string): void {
    this.gameState.removePlayer(uuid);
    this.hostUUID = this.players[0]?.uuid || '';

    this.emitMatchState();
  }

  getUUID(): string {
    return this.uuid;
  }

  emitMatchState() {
    this.namespace.emit(MATCH_STATE_UPDATE, this.toJSONObject());
  }

  toJSONObject() {
    return {
      uuid: this.uuid,
      players: this.players.map((p) => p.getPublicProfile()),
      hostUUID: this.hostUUID,
      inProgress: this.inProgress,
    };
  }

  getNamespace(): Namespace {
    return this.namespace;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  isInProgress(): boolean {
    return this.inProgress;
  }
}
