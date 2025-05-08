import { Socket } from 'socket.io';
import { PROMPT_RESPONSE } from '../constants/events.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS, PROMPT_OPTION_VALUE } from '../constants/promptOptions.ts';
import Player from '../core/entities/Player.ts';
import GameState from '../core/GameState.ts';
import { onceEverySocketExceptOne } from '../socket/utils/listen.ts';
import { emitPromptToOtherPlayers, emitPromptToPlayer, PromptOption } from './utils.ts';

export default abstract class BaseCase {
  protected gameState: GameState;

  protected currentPlayer: Player;

  public constructor(gameState: GameState) {
    this.gameState = gameState;
    this.currentPlayer = gameState.getCurrentTurnPlayer();
  }

  protected async emitPromptToPlayer(
    {
      defaultOption, message, options, targetSocket,
    }:
      {
        defaultOption: PromptOption,
        message: string,
        options: PromptOption[],
        targetSocket: Socket
      },
  ): Promise<string> {
    const namespace = this.gameState.getNamespace();

    emitPromptToPlayer({
      message,
      namespace,
      socket: targetSocket,
      options,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(defaultOption.value.toString()), 5000);

      targetSocket.once(PROMPT_RESPONSE, (res: string) => {
        clearTimeout(timeout);
        resolve(res);
      });
    });
  }

  protected async emitChallengeToOtherPlayers(message: string, timeout: number = 5000) {
    emitPromptToOtherPlayers({
      namespace: this.gameState.getNamespace(),
      socket: this.currentPlayer.socket,
      message,
      options: [
        {
          label: 'Contestar',
          value: PROMPT_OPTION_CHALLENGE_ACCEPT,
        },
        {
          label: 'Passar',
          value: PROMPT_OPTION_CHALLENGE_PASS,
        },
      ],
    });

    return new Promise<{ challengerId: string, response: PROMPT_OPTION_VALUE }>((resolve) => {
      const timeoutId = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.info('Prompt has timed out');

        resolve({ challengerId: '', response: PROMPT_OPTION_CHALLENGE_PASS });
      }, timeout);

      let playersThatPassedChallenge = 0;

      onceEverySocketExceptOne({
        callback: (data, socketId) => {
          const response = (data as PromptOption).value as PROMPT_OPTION_VALUE;

          if (response === PROMPT_OPTION_CHALLENGE_PASS) {
            playersThatPassedChallenge += 1;

            if (playersThatPassedChallenge === this.gameState.getPlayersCount() - 1) {
              clearTimeout(timeoutId);

              resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_PASS });
            }
          } else {
            clearTimeout(timeoutId);

            resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_ACCEPT });
          }
        },
        eventName: PROMPT_RESPONSE,
        excludeSocketId: this.currentPlayer.socket.id,
        namespace: this.gameState.getNamespace(),
      });
    });
  }

  /**
   * Signals that the turn is complete and advances to the next player.
   */
  protected finishTurn(): void {
    console.log('Finishing turn');

    this.gameState.goToNextTurn();
  }
}
