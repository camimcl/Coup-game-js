/* eslint-disable no-console */
import { PROMPT_OPTION_CHALLENGE_ACCEPT } from '../constants/promptOptions.ts';
import { CARD_VARIANT_DUKE } from '../constants/cardVariants.ts';
import Case from './Case.ts';
import Player from '../core/entities/Player.ts';
import GameState from '../core/GameState.ts';

export default class ForeignAidCase extends Case {
  private challengerPlayer!: Player;

  constructor(gameState: GameState) {
    super('Foreign Aid', gameState);
  }

  async runCase() {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    const {
      challengerId,
      response: challengeToAid,
    } = await this.promptService.challengeOthers(
      this.currentPlayer.socket,
      this.gameState.getActivePlayers().length,
      `${this.currentPlayer.name} requisita auxílio externo (2 moedas). Alguém se declara Duque para bloquear?`,
    );

    if (challengeToAid === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      // Alguém se declarou Duque e bloqueou. Agora, o jogador atual pode contestar esse Duque.
      await this.resolveDukeBlock(challengerId);
    } else {
      // Ninguém contestou. Ação bem-sucedida.
      this.currentPlayer.addCoins(2);

      console.debug(`${this.currentPlayer.name} recebeu 2 moedas (auxílio externo)`);
    }

    this.finishTurn();
  }

  private async resolveDukeBlock(challengerId: string) {
    this.challengerPlayer = this.gameState.getPlayerByUUID(challengerId);

    const message = `${this.challengerPlayer!.name} bloqueou o auxílio externo dizendo ser Duque. Deseja contestar?`;

    const response = await this.promptService.challengePlayer(this.currentPlayer.socket, message);

    if (response === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      await this.resolveChallengeToDuke();
    } else {
      // Ninguém contestou o Duque. Bloqueio é bem-sucedido.
      console.debug(`O bloqueio do Duque por ${this.challengerPlayer.name} foi aceito. ${this.currentPlayer.name} não recebe moedas.`);
    }
  }

  private async resolveChallengeToDuke() {
    console.debug(`${this.currentPlayer.name} contestou o Duque de ${this.challengerPlayer.name}`);

    // Duque revela carta
    const dukeCardUUID = await this.promptService.askSingleCard(this.challengerPlayer!);
    const revealedCard = this.challengerPlayer!.getCardByUUID(dukeCardUUID);

    if (revealedCard.variant !== CARD_VARIANT_DUKE) {
      // Duque era falso — carta do falso Duque é descartada
      this.gameState.discardPlayerCard(dukeCardUUID, this.challengerPlayer!);

      // A ação de auxílio externo volta a valer
      this.currentPlayer.addCoins(2);

      console.debug(`Contestação bem-sucedida! ${this.currentPlayer.name} recebe 2 moedas.`);
    } else {
      // Duque era verdadeiro — contra-contestador perde carta
      const cardUUID = await this.promptService.askSingleCard(this.currentPlayer);

      this.gameState.discardPlayerCard(cardUUID, this.currentPlayer);

      // Duque revela e troca carta
      this.gameState.placeCardIntoDeckAndReceiveAnother(revealedCard.uuid, this.challengerPlayer!);

      console.debug(`Contestação ao Duque falhou. ${this.currentPlayer.name} não recebe moedas.`);
    }
  }
}
