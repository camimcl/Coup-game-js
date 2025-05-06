import GameState from '../core/GameState.ts';
import { Case } from './types.ts';

export default class DuqueCase implements Case {
  execute(gameState: GameState) {
    // Tell everyone duque is tyring to get 3 coins
    //
    // Has anyone contested?
    //
    // if yes, ask the current player to choose a card
    //
    // if no, give the current player two cards
  }
}
