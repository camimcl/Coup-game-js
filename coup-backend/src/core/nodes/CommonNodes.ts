import GameState from "../GameState";
import ActionNode from "./ActionNode";

export const getNextTurnActionNode = () => new ActionNode<GameState>((gameState) => {
  gameState.nextTurn();
});

export const getTest = () => new ActionNode<GameState>((gameState) => {
  gameState.nextTurn();
});

