import { Namespace, Server } from 'socket.io';
import EventEmitter from 'events';
import Player from './entities/Player.ts';
import GameState from './GameState.ts';
import { GAME_START, MATCH_STATE_UPDATE, PLAYER_COUNT_UPDATE } from '../constants/events.ts';

/**
 * Manages a single game match: its players, state, and Socket.IO namespace.
 */
export default class Match {
  /** Unique identifier for this match. */
  private uuid: string;

  /** Players currently in the match. */
  private players: Player[];

  /** Indicates whether the match has ended. */
  private hasEnded: boolean = false;

  private inProgress: boolean = false;

  /** The winning player, if the match has concluded. */
  private winner: Player | null = null;

  private hostUUID: string;

  /** The game state manager for this match. */
  private gameState: GameState;

  /** Socket.IO namespace dedicated to this match. */
  private namespace: Namespace;

  readonly internalBus: EventEmitter;

  /**
   * Creates a new Match.
   *
   * @param players - Initial list of players in the match.
   * @param server  - Socket.IO server instance to create a namespace on.
   */
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
      console.log('Already in progress');
      return;
    }

    console.debug(`Starting match: ${this.uuid}`);

    this.gameState.startGame();

    this.inProgress = true;

    this.internalBus.emit(GAME_START);

    this.namespace.emit(GAME_START);

    this.emitMatchState();
  }

  /**
   * Adds a player to the match.
   *
   * @param player - The player to add.
   * @throws If the match has already ended.
   */
  addPlayer(player: Player): boolean {
    if (this.hasEnded) {
      console.warn('Cannot add player: match has already ended.');
      return false; // Indicate failure to add player
    }

    if (this.inProgress) {
      console.warn('Cannot add player: match is already in progress. No new players allowed.');
      return false; // Indicate failure to add player
    }

    this.players.push(player);
    this.hostUUID = this.players[0].uuid;

    this.gameState.broadcastState();
    this.namespace.emit(PLAYER_COUNT_UPDATE, this.players.length);
    this.emitMatchState();

    return true; // Indicate success in adding player
  }
  /**
   * Removes a player from the match by their UUID.
   *
   * @param uuid - UUID of the player to remove.
   */
  removePlayer(uuid: string): void {
    this.namespace.emit(MATCH_STATE_UPDATE, this.toJSONObject());

    this.gameState.removePlayer(uuid);
    this.hostUUID = this.players[0]?.uuid || '';

    this.emitMatchState();
  }

  /**
   * Retrieves the unique identifier for this match.
   *
   * @returns The match UUID.
   */
  getUUID(): string {
    return this.uuid;
  }

  emitMatchState() {
    this.namespace.emit(MATCH_STATE_UPDATE, this.toJSONObject());
  }

  toJSONObject() {
    return {
      uuid: this.uuid,
      players: this.players.map((p) => p.publicProfile()),
      hostUUID: this.hostUUID,
      inProgress: this.inProgress,
    };
  }

  /**
   * Retrieves the Socket.IO namespace for this match.
   *
   * @returns The Namespace instance.
   */
  getNamespace(): Namespace {
    return this.namespace;
  }

  /**
   * Retrieves the current game state manager.
   *
   * @returns The GameState instance.
   */
  getGameState(): GameState {
    return this.gameState;
  }

  isInProgress(): boolean {
    return this.inProgress;
  }
}
