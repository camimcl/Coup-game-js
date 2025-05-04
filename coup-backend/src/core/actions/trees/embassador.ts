// Requisita duas cartas do deck
import { server } from '../../../index';
import GameState from '../../GameState';
import ActionNode from '../../nodes/ActionNode';
import { getNextTurnActionNode } from '../../nodes/CommonNodes';
import DecisionNode from '../../nodes/DecisionNode';
import PromptNode from '../../nodes/PromptNode';
import {
  CARD_CHOSEN, DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE, OPEN_PUBLIC_CHALLENGE,
} from '../events';
import { getScopedEventName } from '../eventsUtil';

const giveTwoCardsToPlayer1Node = new ActionNode<GameState>((ctx) => {
  // Give two cards to the player
});

const giveThreeCardsToPlayer1Node = new ActionNode<GameState>((ctx) => {
  // Give two cards to the player
}, getNextTurnActionNode());

const discardPlayer1Card = new ActionNode<GameState>((ctx) => {
  // The action (get two cards) is not performed and the player1 discards the showed card
});

const discardPlayer2Card = new ActionNode<GameState>((ctx) => {
  // The action (get two cards) is not performed and the player1 discards the showed card
}, giveThreeCardsToPlayer1Node);

const promptCardDiscardToPlayer2Node = new PromptNode<GameState>(
  [
    discardPlayer2Card,
  ],
  (ctx) => {
    // Asks the user which card they want to discard
  },
  (ctx) => {
    // wait for the user answer
    // Set the chosen card into the game state
    // Runs the discardPlayer2Card node
  },
);

const checkEmabassadorNode = new DecisionNode<GameState>((ctx) => {
  // Is the showed card embassador?
  console.log('Checking if card is embassador');

  return false;
}, discardPlayer1Card, promptCardDiscardToPlayer2Node);

const showCardPrompt = new PromptNode<GameState>({
  branches: [checkEmabassadorNode],
  sendPrompt: (ctx) => {
    server.to(ctx.uuid).emit(getScopedEventName(ctx.uuid, OPEN_PUBLIC_CHALLENGE), {
      text: 'Que carta deseja mostrar',
      options: ctx.getCurrentPlayer().getCardsClone().map((card) => card.uuid),
      events: [],
    });
  },
  waitForAnswer: (ctx) => new Promise<number>((resolve) => {
    ctx.socket.once(getScopedEventName(ctx.uuid, CARD_CHOSEN), () => {
      resolve(0);
    });
  }),
});

export default new PromptNode<GameState>(
  {
    branches: [
      giveTwoCardsToPlayer1Node,
      showCardPrompt,
    ],
    sendPrompt: (ctx) => {
      ctx.socket.emit(getScopedEventName(ctx.uuid, OPEN_PUBLIC_CHALLENGE), {
        text: 'Voce quer desafiar?',
        options: ['Desafiar', 'Passar'],
        events: [
          getScopedEventName(ctx.uuid, DO_PUBLIC_CHALLENGE),
          getScopedEventName(ctx.uuid, IGNORE_PUBLIC_CHALLENGE),
        ],
      });
    },
    waitForAnswer: (ctx) => new Promise<number>((resolve) => {
      const doPublicChallengeEventId = getScopedEventName(ctx.uuid, DO_PUBLIC_CHALLENGE);
      const ignorePublicChallengeEventId = getScopedEventName(ctx.uuid, IGNORE_PUBLIC_CHALLENGE);

      let playersThatPassed = 0;

      // If at least one player haven't passed or challenged AND 5 seconds
      // have passed, then player1 can get two cards from the deck.
      const onTimeoutId = setTimeout(() => {
        // Cleaning the listeners
        ctx.socket.removeAllListeners(ignorePublicChallengeEventId);
        ctx.socket.removeAllListeners(doPublicChallengeEventId);

        resolve(0);
      }, 5000);

      // For num_players - 1, count that all players passed the challenge
      ctx.socket.on(ignorePublicChallengeEventId, () => {
        playersThatPassed += 1;

        if (playersThatPassed === ctx.players.length - 1) {
          clearTimeout(onTimeoutId);

          // Cleaning the listener
          ctx.socket.removeAllListeners(ignorePublicChallengeEventId);

          resolve(0);
        }
      });

      // Once, wait for any player to state they challenge player 1
      ctx.socket.once(doPublicChallengeEventId, () => {
        clearTimeout(onTimeoutId);

        // Cleaning the listener
        ctx.socket.removeAllListeners(ignorePublicChallengeEventId);

        resolve(1);
      });
    }),
  },
);
