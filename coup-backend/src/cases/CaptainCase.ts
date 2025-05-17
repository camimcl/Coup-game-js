/* eslint-disable no-console */
import { CARD_VARIANT_AMBASSADOR, CARD_VARIANT_CAPTAIN } from '../constants/cardVariants.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS } from '../constants/promptOptions.ts';
import Player from '../core/entities/Player.ts';
import GameState from '../core/GameState.ts';
import BaseCase from './BaseCase.ts';

const DEFENSE_RESPONSE_ACCEPT = 'ACCEPT';
const DEFENSE_RESPONSE_BLOCK_AS_CAPTAIN = 'BLOCK_AS_CAPTAIN';
const DEFENSE_RESPONSE_BLOCK_AS_EMBASSADOR = 'BLOCK_AS_EMBASSADOR';

type DEFENSE_RESPONSE = typeof PROMPT_OPTION_CHALLENGE_ACCEPT
  | typeof DEFENSE_RESPONSE_ACCEPT
  | typeof DEFENSE_RESPONSE_BLOCK_AS_CAPTAIN
  | typeof DEFENSE_RESPONSE_BLOCK_AS_EMBASSADOR;

export default class CaptainCase extends BaseCase {
  private targetPlayer!: Player;

  constructor(gameState: GameState) {
    super('Steal Two Coins', gameState);
  }

  public canExecute(): boolean {
    const players = this.gameState.getActivePlayers();

    return players.some((p) => p.getCoinsAmount() >= 2) && super.canExecute();
  }

  public async runCase() {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    await this.promptChooseTarget();

    const defenseChoice = await this.promptTargetDefense();

    if (defenseChoice === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      await this.handleClaimChallenge();
    } else if (defenseChoice === DEFENSE_RESPONSE_ACCEPT) {
      this.doRobbery();
    } else if (defenseChoice === DEFENSE_RESPONSE_BLOCK_AS_EMBASSADOR) {
      await this.handleTargetDefense(CARD_VARIANT_AMBASSADOR);
    } else if (defenseChoice === DEFENSE_RESPONSE_BLOCK_AS_CAPTAIN) {
      await this.handleTargetDefense(CARD_VARIANT_CAPTAIN);
    }

    this.finishTurn();
  }

  doRobbery() {
    this.targetPlayer.removeCoins(2);

    this.currentPlayer.addCoins(2);
  }

  async handleTargetDefense(
    chosenInfluence: (typeof CARD_VARIANT_CAPTAIN | typeof CARD_VARIANT_AMBASSADOR),
  ) {
    const influenceLabel = chosenInfluence === CARD_VARIANT_CAPTAIN ? 'Capitão' : 'Embaixador';

    const currentPlayerResponse = await this.promptService.challengePlayer(
      this.currentPlayer.socket,
      `${this.targetPlayer.name} diz ser o ${influenceLabel}. Deseja contestar?`,
    );

    if (currentPlayerResponse === PROMPT_OPTION_CHALLENGE_PASS) {
      return;
    }

    const revealedCardUUID = await this.promptService.askSingleCard(this.targetPlayer);

    const card = this.targetPlayer.getCardByUUID(revealedCardUUID);

    if (card.variant === chosenInfluence) {
      const cardUUID = await this.promptService.askSingleCard(this.currentPlayer);

      this.gameState.discardPlayerCard(cardUUID, this.currentPlayer);

      this.gameState.placeCardIntoDeckAndReceiveAnother(revealedCardUUID, this.targetPlayer);
    } else {
      this.gameState.discardPlayerCard(revealedCardUUID, this.targetPlayer);
    }
  }

  async handleClaimChallenge() {
    const chosenCardUUID = await this.promptService.askSingleCard(this.currentPlayer);

    const chosenCard = this.currentPlayer.getCardByUUID(chosenCardUUID);

    if (chosenCard?.variant === CARD_VARIANT_CAPTAIN) {
      await this.handleTargetPlayerChallengeLoss();

      this.gameState.placeCardIntoDeckAndReceiveAnother(chosenCardUUID, this.currentPlayer);

      this.doRobbery();
    } else {
      this.gameState.discardPlayerCard(chosenCardUUID, this.currentPlayer);
    }
  }

  async handleTargetPlayerChallengeLoss() {
    const chosenCardUUID = await this.promptService.askSingleCard(this.targetPlayer);

    this.gameState.discardPlayerCard(chosenCardUUID, this.targetPlayer);
  }

  private async promptChooseTarget(): Promise<void> {
    const options = this.gameState
      .getActivePlayers()
      .filter((p) => p.uuid !== this.currentPlayer.uuid && p.getCoinsAmount() >= 2)
      .map((p) => ({ label: p.name, value: p.uuid }));

    if (options.length === 0) {
      throw new Error('No player has two coins');
    }

    const chosenUuid: string = await this.promptService.prompt(
      this.currentPlayer.socket,
      'Escolha um jogador para roubar',
      options,
      options[0].value,
    );

    const target = this.gameState.getPlayerByUUID(chosenUuid);

    if (!target) throw new Error('Jogador alvo não encontrado.');

    this.targetPlayer = target;

    console.debug(`Chosen target: ${target.name}`);
  }

  private async promptTargetDefense(): Promise<DEFENSE_RESPONSE> {
    const options = [
      { label: 'Aceitar roubo', value: DEFENSE_RESPONSE_ACCEPT },
      { label: 'Desafiar', value: PROMPT_OPTION_CHALLENGE_ACCEPT },
      { label: 'Defender-se como capitao', value: DEFENSE_RESPONSE_BLOCK_AS_CAPTAIN },
      { label: 'Defender-se como Embassador', value: DEFENSE_RESPONSE_BLOCK_AS_EMBASSADOR },
    ];

    return await this.promptService.prompt(
      this.targetPlayer.socket,
      `${this.currentPlayer.name} está tentando te roubar. O que você deseja fazer?`,
      options,
      options[0].value,
    ) as DEFENSE_RESPONSE;
  }
}
