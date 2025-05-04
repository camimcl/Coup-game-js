import { Socket } from "socket.io";

export interface GameContext {
  socket: Socket;
  // your game state here:
  player2Moves: number;
  coins: number;
  // …etc…
}

export interface AsyncNode<Ctx> {
  execute(ctx: Ctx): Promise<void>;
}

// DecisionNode: test → branch
export class DecisionNode<Ctx> implements AsyncNode<Ctx> {
  constructor(
    private test: (c: Ctx) => boolean,
    private onTrue: AsyncNode<Ctx>,
    private onFalse: AsyncNode<Ctx>
  ) {}

  async execute(ctx: Ctx) {
    if (this.test(ctx)) {
      await this.onTrue.execute(ctx);
    } else {
      await this.onFalse.execute(ctx);
    }
  }
}

// ActionNode: leaf
export class ActionNode<Ctx> implements AsyncNode<Ctx> {
  constructor(private fn: (c: Ctx) => Promise<void>) {}

  execute(ctx: Ctx) {
    return this.fn(ctx);
  }
}

// PromptNode: “pause” until the client replies
export class PromptNode<Ctx> implements AsyncNode<Ctx> {
  constructor(
    /**
     * send UI prompt to the client
     */
    private sendQuestion: (c: Ctx) => void,
    /**
     * return a promise that resolves with the index of the chosen option
     */
    private waitForAnswer: (c: Ctx) => Promise<number>,
    /**
     * one child per choice
     */
    private branches: AsyncNode<Ctx>[]
  ) {}

  async execute(ctx: Ctx) {
    // 1) send the buttons
    this.sendQuestion(ctx);

    // 2) wait for the click
    const choice = await this.waitForAnswer(ctx);

    // 3) resume down the chosen branch
    await this.branches[choice].execute(ctx);
  }
}

