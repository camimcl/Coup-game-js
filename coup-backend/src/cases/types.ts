import GameState from '../core/GameState.ts';

export interface Case {
  execute(gameState: GameState): void;
}
