import ActionNode from '../../nodes/ActionNode';
import GameState from '../../GameState';
import { getNextTurnActionNode } from '../../nodes/CommonNodes';
import { END_TURN, MESSAGE } from '../events';

const giveIncome = new ActionNode<GameState>(
  async (gameState, namespaceServer) => {
    // Add 1 coin to the player's total
    gameState.getCurrentPlayer().coins += 1;
    console.log(gameState.getCurrentPlayer().coins);

    // Notify the player
    namespaceServer.emit(MESSAGE, "Você ganhou 1 moeda!");

    // End the turn after the action
    namespaceServer.emit(END_TURN);
  },
  getNextTurnActionNode()
);

export default giveIncome;