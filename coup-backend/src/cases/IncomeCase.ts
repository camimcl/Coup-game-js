import GameState from '../core/GameState.ts';
import BaseCase from './BaseCase.ts';

/// player takes 1 coin (unchallengeable)
export default class IncomeCase extends BaseCase {
  constructor(gameState: GameState) {
    super('Income', gameState);
  }

  public async runCase(): Promise<void> {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    this.giveIncome();

    this.finishTurn();
  }

  private giveIncome(): void {
    console.debug(`${this.currentPlayer.name} recebe 1 moeda de renda.`);

    this.currentPlayer.addCoins(1);

    console.debug(`${this.currentPlayer.name} tem ${this.currentPlayer.getCoinsAmount()} moedas`);
  }
}
