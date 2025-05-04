import { AsyncNode } from './AsyncNode';

/**
  * A node that executed an given action
*/
export default class ActionNode<Ctx> implements AsyncNode<Ctx> {
  /**
    * The action that will be executed
  */
  private doAction: (c: Ctx) => Promise<void>;

  /**
    * The node that will run after this action is perfomed
  */
  private nextNode: AsyncNode<Ctx> | undefined;

  constructor(doAction: (c: Ctx) => Promise<void>, nextAction?: ActionNode<Ctx>) {
    this.doAction = doAction;
    this.nextNode = nextAction;
  }

  async execute(ctx: Ctx) {
    await this.doAction(ctx);

    if (this.nextNode) {
      this.nextNode.execute(ctx);
    }
  }
}
