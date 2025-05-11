import BaseCase from './BaseCase.ts';
export default class IncomeCase extends BaseCase {
    // player takes 1 coin (unchallengeable)
    public async getIncome(): Promise<void> {
        this.giveIncome();
        this.finishTurn();
    }
    private giveIncome(): void {
        console.debug(`${this.currentPlayer.name} recebe 1 moeda de renda.`);
        this.currentPlayer.addCoins(1)
    }
} 