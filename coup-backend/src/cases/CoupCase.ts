import askPlayerToChooseCard from './utils.ts';
import BaseCase from './BaseCase.ts';
import Player from '../core/entities/Player.ts';

export default class CoupCase extends BaseCase {
  private targetPlayer!: Player;

  async execute() {
    const coins = this.currentPlayer.getCoinsAmount();

    // Impedir execução da ação se não tiver moedas suficientes
    if (coins < 7) {
      throw new Error(`${this.currentPlayer.name} não tem moedas suficientes para dar o golpe.`);
    }

    const namespace = this.gameState.getNamespace();

    // Pede para o jogador escolher quem será o alvo
    await this.promptChooseTarget();

    // Gasta 7 moedas
    this.currentPlayer.removeCoins(7);

    // Alvo escolhe carta para perder
    const chosenCardUUID = await askPlayerToChooseCard(namespace, this.targetPlayer);

    // Descarte visível
    this.gameState.discardPlayerCard(chosenCardUUID, this.targetPlayer);

    console.debug(`${this.targetPlayer.name} perdeu uma carta por golpe de estado.`);

    this.finishTurn();
  }

  private async promptChooseTarget(): Promise<void> {
    const options = this.gameState
      .getActivePlayers()
      .filter((p) => p.uuid !== this.currentPlayer.uuid)
      .map((p) => ({ label: p.name, value: p.uuid }));

    const chosenUuid: string = await this.emitPromptToPlayer({
      defaultOption: options[0],
      message: 'Escolha um jogador para dar o golpe de Estado',
      targetSocket: this.currentPlayer.socket,
      options,
    });

    console.log(`Chosen target: ${chosenUuid}`);

    const target = this.gameState.getPlayerByUUID(chosenUuid);

    if (!target) throw new Error('Jogador alvo não encontrado.');

    this.targetPlayer = target;
  }
}
