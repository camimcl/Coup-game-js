import { AsyncNode } from './AsyncNode';

/**
  * A node that decide which branch to follow based on a condition
*/
export default class DecisionNode<Ctx> implements AsyncNode<Ctx> {
  /**
    * The test function
  */
  private isConditionTrue: (c: Ctx) => boolean;

  /**
    * The node that will be executed when `isConditionTrue` returns `true`
  */
  private onTrueNode: AsyncNode<Ctx>;

  /**
    * The node that will be executed when `isConditionTrue` returns `false`
  */
  private onFalseNode: AsyncNode<Ctx>;

  constructor(
    isConditionTrue: (c: Ctx) => boolean,
    onFalseNode: AsyncNode<Ctx>,
    onTrueNode: AsyncNode<Ctx>,
  ) {
    this.isConditionTrue = isConditionTrue;
    this.onFalseNode = onFalseNode;
    this.onTrueNode = onTrueNode;
  }

  async execute(ctx: Ctx) {
    if (this.isConditionTrue(ctx)) {
      await this.onTrueNode.execute(ctx);
    } else {
      await this.onFalseNode.execute(ctx);
    }
  }
}
