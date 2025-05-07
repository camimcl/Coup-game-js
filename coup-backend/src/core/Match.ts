import { Namespace, Server } from 'socket.io';
import Player from './entities/Player.ts';
import GameState from './GameState.ts';

export default class Match {
  private uuid: string;

  private players: Player[];

  private hasEnded: boolean = false;

  private winner: Player | null = null;

  private gameState: GameState;

  private namespace: Namespace;

  constructor(players: Player[], server: Server) {
    this.players = players;

    this.uuid = '123';
    this.namespace = server.of(this.uuid);
    this.gameState = new GameState(this.namespace, this.players);

    console.debug(`Starting match with id: ${this.uuid}`);
  }

  addPlayer(player: Player) {
    // TODO: checar se a partida ja comecou. Se sim, ninguem mais pode entrar
    this.players.push(player);
  }

  removePlayer(uuid: string) {
    this.players = this.players.filter((player) => player.uuid !== uuid);
  }

  getUUID() {
    return this.uuid;
  }

  getNamespace() {
    return this.namespace;
  }

  getGameState() {
    return this.gameState;
  }
}
