/* eslint-disable no-console */
import GameState from '../core/GameState.ts';
import Case from './Case.ts';

export default class IncomeCase extends Case {
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
