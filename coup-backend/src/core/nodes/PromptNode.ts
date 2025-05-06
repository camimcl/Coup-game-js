import { Namespace } from 'socket.io';
import { AsyncNode } from './AsyncNode';

/**
  * A node that prompts a question to the client and waits for an answer
*/
export default class PromptNode<GameState> implements AsyncNode<GameState> {
  /**
    * How many options the player has
  */
  private branches: AsyncNode<GameState>[];

  /**
    * Send a prompt to the client
  */
  private sendPrompt: (gameState: GameState, namespaceServer: Namespace) => void;

  /**
    * Return a promise that resolves with the index of the chosen option
  */
  private waitForAnswer: (gameState: GameState, namespaceServer: Namespace) => Promise<number>;

  constructor({ branches, sendPrompt, waitForAnswer }: {
    branches: AsyncNode<GameState>[],
    sendPrompt: (gameState: GameState, namespaceServer: Namespace) => void,
    waitForAnswer: (gameState: GameState, namespaceServer: Namespace) => Promise<number>
  }) {
    this.branches = branches;
    this.waitForAnswer = waitForAnswer;
    this.sendPrompt = sendPrompt;
  }

  async execute(gameState: GameState, namespaceServer: Namespace) {
    this.sendPrompt(gameState, namespaceServer);

    const choice = await this.waitForAnswer(gameState, namespaceServer);

    if (typeof choice === 'number') {
      const branch = this.branches[choice];

      await branch.execute(gameState, namespaceServer);
    } else {
      // TODO: tell user that the option is invalid
    }
  }
}
