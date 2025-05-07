import { PROMPT_RESPONSE } from '../constants/events.ts';
import GameState from '../core/GameState.ts';
import { listenOnceEverySocketExcept, listenOnEverySocketExcept } from '../socket/utils/listen.ts';
import { emitPromptToOtherPlayers, emitPromptToPlayer, PromptOption } from '../socket/utils/emitPrompt.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS, PROMPT_OPTION_VALUE } from '../constants/promptOptions.ts';
import askPlayerToChooseCard from './utils.ts';
import { CARD_VARIANT_ASSASSIN, CARD_VARIANT_DUQUE, CARD_VARIANT_EMBASSADOR } from '../constants/cardVariants.ts';
import Player from '../core/entities/Player.ts';
import Card from '../core/entities/Card.ts';

export default async function execute(gameState: GameState) {
  const currentPlayer = gameState.getCurrentTurnPlayer();
  const { namespace } = gameState;

  const currentPlayerSocket = currentPlayer.socket;

  async function emitChallengeToOtherPlayers() {
    emitPromptToOtherPlayers({
      namespace,
      socket: currentPlayerSocket,
      message: `${currentPlayer.name} diz ser o duque e está requisitando 3 moedas`,
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
      }, 5000);

      let playersThatPassedChallenge = 0;

      listenOnceEverySocketExcept({
        callback: (data, socketId) => {
          const response = (data as PromptOption).value as PROMPT_OPTION_VALUE;

          if (response === PROMPT_OPTION_CHALLENGE_PASS) {
            playersThatPassedChallenge += 1;

            if (playersThatPassedChallenge === gameState.players.length - 1) {
              clearTimeout(timeoutId);

              resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_PASS });
            }
          } else {
            clearTimeout(timeoutId);

            resolve({ challengerId: socketId, response: PROMPT_OPTION_CHALLENGE_ACCEPT });
          }
        },
        eventName: PROMPT_RESPONSE,
        exceptionSocket: currentPlayerSocket,
        namespace,
      });
    });
  }

  const { challengerId, response: challengeResolution } = await emitChallengeToOtherPlayers();

  const challengerPlayer = gameState.getPlayerByUUID(challengerId);

  console.debug('The challenge has been accepted:', challengeResolution);

  if (challengeResolution === PROMPT_OPTION_CHALLENGE_ACCEPT) {
    console.log('O desafio foi criado...');

    const currentPlayerChosenCardUUID = await askPlayerToChooseCard(namespace, currentPlayer);

    const chosenCard = currentPlayer.getCardByUUID(currentPlayerChosenCardUUID);

    if (chosenCard.variant === CARD_VARIANT_DUQUE) {
      console.log('The chosen card is duque, player2 must choose a card');

      const challengerChosenCardUUID = await askPlayerToChooseCard(namespace, challengerPlayer);

      console.log('Discarding the chosen card.');

      gameState.discardPlayerCard(challengerChosenCardUUID, challengerPlayer);

      // Give a card to the currentPlayer
      console.log('Current player receives a new card');
      currentPlayer.addCard(new Card(CARD_VARIANT_ASSASSIN));

      // TODO: devemos descartar a carta primeiro, embaralhar o deck e pegar uma carta nova
      // Discard the duque card from the currentPlayer
      console.log('Current player discards the duque card');
      gameState.discardPlayerCard(currentPlayerChosenCardUUID, currentPlayer);

      console.log('Current player won the challenge!');

      currentPlayer.coins += 3;

      console.log(`Now he has ${currentPlayer.coins} coins`);
    } else {
      console.log('The chosen card is not duque. Discarding the chosen card.');

      gameState.discardPlayerCard(currentPlayerChosenCardUUID, currentPlayer);
    }
  } else {
    console.log('Current player has won 3 coins because no one challenger him');

    currentPlayer.coins += 3;

    console.log(`Now he has ${currentPlayer.coins} coins`);
  }

  // Tell everyone duque is tyring to get 3 coins
  //
  // Has anyone contested?
  //
  // if yes, ask the current player to choose a card
  //
  // if no, give the current player two cards
}
