import { Namespace } from 'socket.io';
import { PROMPT_RESPONSE } from '../constants/events.ts';
import Player from '../core/entities/Player.ts';
import { emitPromptToPlayer } from '../socket/utils/emitPrompt.ts';

/// Ask a player to choose a card among the cards their own.
/// If timeout is passed and a card is not chosen, the first
/// card is chosen
/// @Returns the uuid of the chosen card
export default async function askPlayerToChooseCard(
  namespace: Namespace,
  player: Player,
) {
  const options = player.getCardsClone().map((card) => ({ label: card.variant, value: card.uuid }));

  emitPromptToPlayer({
    namespace,
    socket: player.socket,
    message: 'Voce esta sendo contestado como duque. Escolha uma carta.',
    options,
  });

  return new Promise<string>((resolve) => {
    const timeoutId = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.debug('Prompt to choose card has timed out');

      resolve(options[0].value);
    }, 5000);

    player.socket.on(PROMPT_RESPONSE, (response) => {
      clearTimeout(timeoutId);

      resolve(response);
    });
  });
}
