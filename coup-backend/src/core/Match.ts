import { Namespace, Server } from 'socket.io';
import Player from './entities/Player.ts';
import GameState from './GameState.ts';

export default class Match {
  private uuid: string;

  private players: Player[];

  private hasEnded: boolean = false;

  private winner: Player | null = null;

  private gameState: GameState;

  private matchNamespace: Namespace;

  constructor(players: Player[], server: Server) {
    this.players = players;

    this.gameState = new GameState(this.players);
    this.uuid = crypto.randomUUID();
    this.matchNamespace = server.of(this.uuid);

    console.debug(`Starting match with id: ${this.uuid}`);
  }

  addPlayer(player: Player) {
    // TODO: checar se a partida ja comecou. Se sim, ninguem mais pode entrar
    this.players.push(player);
  }

  removePlayer(uuid: string) {
    this.players = this.players.filter((player) => player.uuid !== uuid);
  }
}
