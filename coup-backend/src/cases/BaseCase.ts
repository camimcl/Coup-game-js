import { PROMPT_RESPONSE } from '../constants/events.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS, PROMPT_OPTION_VALUE } from '../constants/promptOptions.ts';
import Player from '../core/entities/Player.ts';
import GameState from '../core/GameState.ts';
import { emitPromptToOtherPlayers, PromptOption } from '../socket/utils/emitPrompt.ts';
import { onceEverySocketExceptOne } from '../socket/utils/listen.ts';

export default abstract class BaseCase {
  protected gameState: GameState;

  protected currentPlayer: Player;

  protected constructor(gameState: GameState) {
    this.gameState = gameState;
    this.currentPlayer = gameState.getCurrentTurnPlayer();
  }

  protected async emitChallengeToOtherPlayers(timeout: number = 5000) {
    emitPromptToOtherPlayers({
      namespace: this.gameState.namespace,
      socket: this.currentPlayer.socket,
      message: `${this.currentPlayer.name} diz ser o duque e está requisitando 3 moedas`,
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

            if (playersThatPassedChallenge === this.gameState.getPlayersAmount() - 1) {
              clearTimeout(timeoutId);

              resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_PASS });
            }
          } else {
            clearTimeout(timeoutId);

            resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_ACCEPT });
          }
        },
        eventName: PROMPT_RESPONSE,
        exceptionSocket: this.currentPlayer.socket,
        namespace: this.gameState.namespace,
      });
    });
  }
}
