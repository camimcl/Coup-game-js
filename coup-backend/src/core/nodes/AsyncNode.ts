import { Namespace } from 'socket.io';

export interface AsyncNode<GameState> {
  execute(gameState: GameState, namespaceServer: Namespace): Promise<void>;
}
