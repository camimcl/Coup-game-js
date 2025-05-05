import { Namespace } from 'socket.io';
import GameState from '../GameState';
import ActionNode from './ActionNode';
import PromptNode from './PromptNode';
import {
  CARD_CHOSEN, DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE, PROMPT,
} from '../actions/events';
import { AsyncNode } from './AsyncNode';
import DecisionNode from './DecisionNode';

export const getNextTurnActionNode = (): ActionNode<GameState> => new ActionNode<GameState>((gameState) => new Promise<void>((resolve) => {
  gameState.nextTurn();

  resolve();
}));

export const getDecisionNode = ({ isConditionTrue, onFalseNode, onTrueNode }: {
  isConditionTrue: (gameState: GameState) => boolean,
  onFalseNode: AsyncNode<GameState>,
  onTrueNode: AsyncNode<GameState>,
}) => new DecisionNode<GameState>(isConditionTrue, onFalseNode, onTrueNode);

export const getChooseOwnedCardNode = ({ onCardChosenNode, sendPrompt }: {
  onCardChosenNode: AsyncNode<GameState>,
  sendPrompt: (gameState: GameState, namespaceServer: Namespace) => void,
  timeout?: number
}) => new PromptNode<GameState>({
  branches: [onCardChosenNode],
  sendPrompt,
  waitForAnswer: (_, namespaceServer) => new Promise<number>((resolve) => {
    // TODO: Add a timeout to choose a random card if the user takes too long

    namespaceServer.sockets.forEach((socket) => {
      socket.once(CARD_CHOSEN, () => {
        console.log('Card chosen');

        resolve(0);
      });
    });
  }),
});

export const getChallengeNode = (
  {
    onChallengedNode, onPassedNode, sendPrompt, timeout = 5000,
  }: {
    onChallengedNode: AsyncNode<GameState>,
    onPassedNode: AsyncNode<GameState>,
    sendPrompt: (gameState: GameState, namespaceServer: Namespace) => void,
    timeout?: number
  },
) => {
  function waitForAnswer(gameState: GameState, namespaceServer: Namespace) {
    return new Promise<number>((resolve) => {
      // If at least one player haven't challenged AND `timeout` seconds
      // has passed. Then the current player can do the action
      const onTimeoutId = setTimeout(() => resolve(0), timeout);

      // Wait for any player to challenge the current player
      namespaceServer.sockets.forEach((socket) => {
        socket.once(DO_PUBLIC_CHALLENGE, () => {
          clearTimeout(onTimeoutId);

          resolve(1);
        });
      });

      let playersThatPassed = 0;

      // When all other players ignored the challenge, then allow the current player action
      namespaceServer.sockets.forEach((socket) => {
        socket.on(IGNORE_PUBLIC_CHALLENGE, () => {
          playersThatPassed += 1;

          if (playersThatPassed === gameState.players.length - 1) {
            clearTimeout(onTimeoutId);

            resolve(0);
          }
        });
      });
    });
  }

  return new PromptNode<GameState>(
    {
      branches: [onPassedNode, onChallengedNode],
      sendPrompt,
      waitForAnswer,
    },
  );
};
