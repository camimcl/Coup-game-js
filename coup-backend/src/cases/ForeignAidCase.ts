import { PROMPT_OPTION_CHALLENGE_ACCEPT } from '../constants/promptOptions.ts';
import askPlayerToChooseCard from './utils.ts';
import { CARD_VARIANT_DUKE } from '../constants/cardVariants.ts';
import BaseCase from './BaseCase.ts';
import Player from '../core/entities/Player.ts';

export default class ForeignAidCase extends BaseCase {
  private challengerPlayer: Player | null = null;

  async foreignAid() {
    const {
      challengerId,
      response: challengeToAid,
    } = await this.emitChallengeToOtherPlayers(`${this.currentPlayer.name} requisita auxílio externo (2 moedas). Alguém se declara Duque para bloquear?`);

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
    const namespace = this.gameState.getNamespace();

    const {
      challengerId: counterChallengerId,
      response: challengeToDuke,
    } = await this.emitChallengeToOtherPlayers(`${this.challengerPlayer!.name} bloqueou o auxílio externo dizendo ser Duque. Alguém deseja contestar isso?`);

    if (challengeToDuke === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      await this.resolveChallengeToDuke(counterChallengerId!);
    } else {
      // Ninguém contestou o Duque. Bloqueio é bem-sucedido.
      console.debug(`O bloqueio do Duque por ${this.challengerPlayer.name} foi aceito. ${this.currentPlayer.name} não recebe moedas.`);
    }
  }

  private async resolveChallengeToDuke(counterChallengerId: string) {
    const namespace = this.gameState.getNamespace();
    const counterChallenger = this.gameState.getPlayerByUUID(counterChallengerId);

    console.debug(`${counterChallenger.name} contestou o Duque de ${this.challengerPlayer!.name}`);

    // Duque revela carta
    const dukeCardUUID = await askPlayerToChooseCard(namespace, this.challengerPlayer!);
    const revealedCard = this.challengerPlayer!.getCardByUUID(dukeCardUUID);

    if (revealedCard.variant !== CARD_VARIANT_DUKE) {
      // Duque era falso — carta do falso Duque é descartada
      this.gameState.discardPlayerCard(dukeCardUUID, this.challengerPlayer!);

      // A ação de auxílio externo volta a valer
      this.currentPlayer.addCoins(2);
      console.debug(`Contestação bem-sucedida! ${this.currentPlayer.name} recebe 2 moedas.`);
    } else {
      // Duque era verdadeiro — contra-contestador perde carta
      const counterChallengerCardUUID = await askPlayerToChooseCard(namespace, counterChallenger);
      this.gameState.discardPlayerCard(counterChallengerCardUUID, counterChallenger);

      // Duque revela e troca carta
      this.gameState.discardRevealedCard(revealedCard, this.challengerPlayer!);

      console.debug(`Contestação ao Duque falhou. ${this.currentPlayer.name} não recebe moedas.`);
    }
  }
}
