import { Namespace } from 'socket.io';
import { AsyncNode } from './AsyncNode';

/**
  * A node that decide which branch to follow based on a condition
*/
export default class DecisionNode<GameState> implements AsyncNode<GameState> {
  /**
    * The test function
  */
  private isConditionTrue: (gameState: GameState) => boolean;

  /**
    * The node that will be executed when `isConditionTrue` returns `true`
  */
  private onTrueNode: AsyncNode<GameState>;

  /**
    * The node that will be executed when `isConditionTrue` returns `false`
  */
  private onFalseNode: AsyncNode<GameState>;

  constructor(
    isConditionTrue: (gameState: GameState) => boolean,
    onFalseNode: AsyncNode<GameState>,
    onTrueNode: AsyncNode<GameState>,
  ) {
    this.isConditionTrue = isConditionTrue;
    this.onFalseNode = onFalseNode;
    this.onTrueNode = onTrueNode;
  }

  async execute(gameState: GameState, namespaceServer: Namespace) {
    if (this.isConditionTrue(gameState)) {
      await this.onTrueNode.execute(gameState, namespaceServer);
    } else {
      await this.onFalseNode.execute(gameState, namespaceServer);
    }
  }
}
