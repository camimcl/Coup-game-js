import { Namespace } from 'socket.io';
import { AsyncNode } from './AsyncNode';

/**
  * A node that executed an given action
*/
export default class ActionNode<GameState> implements AsyncNode<GameState> {
  /**
    * The action that will be executed
  */
  private doAction: (gameState: GameState, namespaceServer: Namespace) => Promise<void>;

  /**
    * The node that will run after this action is perfomed
  */
  private nextNode: AsyncNode<GameState> | undefined;

  constructor(doAction: (ctx: GameState) => Promise<void>, nextAction?: ActionNode<GameState>) {
    this.doAction = doAction;
    this.nextNode = nextAction;
  }

  async execute(gameState: GameState, namespaceServer: Namespace) {
    await this.doAction(gameState, namespaceServer);

    if (this.nextNode) {
      this.nextNode.execute(gameState, namespaceServer);
    }
  }
}
