import { AsyncNode } from './nodes/AsyncNode';

/**
  * A node that prompts a question to the client and waits for an answer
*/
export default class PromptNode<Ctx> implements AsyncNode<Ctx> {
  /**
    * How many options the player has
  */
  private branches: AsyncNode<Ctx>[];

  /**
    * Send a prompt to the client
  */
  private sendPrompt: (c: Ctx) => void;

  /**
    * Return a promise that resolves with the index of the chosen option
  */
  private waitForAnswer: (c: Ctx) => Promise<number>;

  constructor({ branches, sendPrompt, waitForAnswer }: {
    branches: AsyncNode<Ctx>[],
    sendPrompt: (c: Ctx) => void,
    waitForAnswer: (c: Ctx) => Promise<number>
  }) {
    this.branches = branches;
    this.waitForAnswer = waitForAnswer;
    this.sendPrompt = sendPrompt;
  }

  async execute(ctx: Ctx) {
    this.sendPrompt(ctx);

    const choice = await this.waitForAnswer(ctx);

    if (typeof choice === 'number') {
      await this.branches[choice].execute(ctx);
    } else {
      // TODO: tell user that the option is invalid
    }
  }
}
