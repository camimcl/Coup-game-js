import { Namespace, Server } from 'socket.io';
import EventEmitter from 'events';
import Player from './entities/Player.ts';
import GameState from './GameState.ts';
import { GAME_START } from '../constants/events.ts';

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

  /** The winning player, if the match has concluded. */
  private winner: Player | null = null;

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
    this.internalBus = internalBus;
    this.gameState = new GameState(internalBus, this.namespace, this.players);
  }

  public startMatch() {
    console.debug(`Starting match: ${this.uuid}`);

    this.internalBus.emit(GAME_START);

    this.gameState.startGame();
  }

  /**
   * Adds a player to the match.
   *
   * @param player - The player to add.
   * @throws If the match has already ended.
   */
  addPlayer(player: Player): void {
    if (this.hasEnded) {
      throw new Error('Cannot add player: match has already ended.');
    }
    this.players.push(player);
  }

  /**
   * Removes a player from the match by their UUID.
   *
   * @param uuid - UUID of the player to remove.
   */
  removePlayer(uuid: string): void {
    this.players = this.players.filter((p) => p.uuid !== uuid);
  }

  /**
   * Retrieves the unique identifier for this match.
   *
   * @returns The match UUID.
   */
  getUUID(): string {
    return this.uuid;
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
}
