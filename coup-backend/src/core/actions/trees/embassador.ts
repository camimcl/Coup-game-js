// Requisita duas cartas do deck
import { server } from '../../../index';
import GameState from '../../GameState';
import ActionNode from '../../nodes/ActionNode';
import { getNextTurnActionNode } from '../../nodes/CommonNodes';
import DecisionNode from '../../nodes/DecisionNode';
import PromptNode from '../../nodes/PromptNode';
import {
  CARD_CHOSEN, DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE, OPEN_PUBLIC_CHALLENGE,
  PROMPT,
} from '../events';

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
  sendPrompt: (gameState, namespaceServer) => {
    namespaceServer.emit(PROMPT, {
      text: 'Voce esta sendo desafiado como embaixador, que carta deseja mostrar?',
      options: gameState.getCurrentPlayer()?.getCardsClone().map((card) => card.uuid) || [],
      events: [],
    });
  },
  waitForAnswer: (_, namespaceServer) => new Promise<number>((resolve) => {
    namespaceServer.once(CARD_CHOSEN, () => {
      // Retrieve the card id from the payload and save into the game state
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
    sendPrompt: (_, namespaceServer) => {
      namespaceServer.emit(PROMPT, {
        text: 'Fulano se diz embaixador e quer duas cartas do deck',
        options: ['Desafiar', 'Passar'],
        events: [
          DO_PUBLIC_CHALLENGE,
          IGNORE_PUBLIC_CHALLENGE,
        ],
      });
    },
    waitForAnswer: (gameState, namespaceServer) => new Promise<number>((resolve) => {
      // If at least one player haven't challenged AND 5 seconds
      // have passed, then player1 can get two cards from the deck.
      const onTimeoutId = setTimeout(() => resolve(0), 15000);

      // Once, wait for any player to state they challenge player 1
      namespaceServer.sockets.forEach((socket) => {
        socket.once(DO_PUBLIC_CHALLENGE, () => {
          clearTimeout(onTimeoutId);

          resolve(1);
        });
      });

      let playersThatPassed = 0;

      // For num_players - 1, count that all players ignored the challenge
      namespaceServer.sockets.forEach((socket) => {
        socket.on(IGNORE_PUBLIC_CHALLENGE, () => {
          playersThatPassed += 1;

          if (playersThatPassed === gameState.players.length - 1) {
            clearTimeout(onTimeoutId);

            resolve(0);
          }
        });
      });
    }),
  },
);
