import GameState from '../core/GameState.ts';

export default class Case {
  protected gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  async execute(_gameState: GameState) {
    throw new Error('Not implemented');
  }
}
