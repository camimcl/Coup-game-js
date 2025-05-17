/* eslint-disable no-console */
import BaseCase from './BaseCase.ts';
import Player from '../core/entities/Player.ts';
import { CARD_VARIANT_ASSASSIN, CARD_VARIANT_CONDESSA } from '../constants/cardVariants.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS } from '../constants/promptOptions.ts';
import GameState from '../core/GameState.ts';

export default class AssassinCase extends BaseCase {
  private targetPlayer!: Player;

  constructor(gameState: GameState) {
    super('Kill', gameState);
  }

  public canExecute(): boolean {
    return this.gameState.getCurrentTurnPlayer().getCoinsAmount() >= 3 && super.canExecute();
  }

  public async runCase(): Promise<void> {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    this.verifyCoins();
    this.payCoins();

    await this.promptChooseTarget();

    const defenseChoice = await this.promptTargetDefense();

    console.log(`Defense choice ${defenseChoice}`);

    if (defenseChoice === 'ACCEPT') {
      await this.applyAssassination();
    } else if (defenseChoice === 'BLOCK') {
      await this.handleCondessaBlock();
    } else {
      await this.handleClaimChallenge();
    }

    this.finishTurn();
  }

  private verifyCoins(): void {
    if (this.currentPlayer.getCoinsAmount() < 3) {
      throw new Error('Você precisa ter pelo menos 3 moedas para assassinar.');
    }
  }

  private payCoins(): void {
    console.debug(`${this.currentPlayer.name} paga 3 moedas para assassinar.`);
    this.currentPlayer.removeCoins(3);
  }

  private async promptChooseTarget(): Promise<void> {
    const options = this.gameState
      .getActivePlayers()
      .filter((p) => p.uuid !== this.currentPlayer.uuid)
      .map((p) => ({ label: p.name, value: p.uuid }));

    const chosenUuid: string = await this.promptService.prompt(
      this.currentPlayer.socket,
      'Escolha um jogador para assassinar',
      options,
      options[0].value,
    );

    console.log(`Chosen target: ${chosenUuid}`);

    const target = this.gameState.getPlayerByUUID(chosenUuid);
    if (!target) throw new Error('Jogador alvo não encontrado.');
    this.targetPlayer = target;
  }

  private async promptTargetDefense(): Promise<string> {
    const options = [
      { label: 'Aceitar assassinato', value: 'ACCEPT' },
      { label: 'Desafiar', value: PROMPT_OPTION_CHALLENGE_ACCEPT },
      { label: 'Dizer que é a Condessa', value: 'BLOCK' },
    ];

    return this.promptService.prompt(
      this.targetPlayer.socket,
      `${this.currentPlayer.name} está tentando te assassinar. O que você deseja fazer?`,
      options,
      options[0].value,
    );
  }

  private async applyAssassination(): Promise<void> {
    const uuid = await this.promptService.askSingleCard(this.targetPlayer);

    console.log(`Discarding card ${uuid} from player ${this.targetPlayer.name}`);

    this.gameState.discardPlayerCard(uuid, this.targetPlayer);
  }

  private async handleCondessaBlock(): Promise<void> {
    const options = [
      {
        label: 'Contestar',
        value: PROMPT_OPTION_CHALLENGE_ACCEPT,
      },
      {
        label: 'Passar',
        value: PROMPT_OPTION_CHALLENGE_PASS,
      },
    ];

    const response = await this.promptService.prompt(
      this.currentPlayer.socket,
      `${this.targetPlayer.name} diz ser a Condessa e bloqueia o assassinato. O que deseja fazer`,
      options,
      options[0].value,
    );

    if (response === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      console.log('Challenge accepted');

      await this.handleBlockChallenge();
    } else {
      console.log('Challenge not accepted, doing nothing and moving to the next turn.');
    }
  }

  private async handleBlockChallenge(): Promise<void> {
    // Target reveals a card
    const revealedUuid = await this.promptService.askSingleCard(this.targetPlayer);

    const revealed = this.targetPlayer.getCardByUUID(revealedUuid);

    if (revealed.variant === CARD_VARIANT_CONDESSA) {
      console.log('The card is Consessa');

      // Challenge failed: challenger loses both cards
      const chosenCardUuid = await this.promptService.askSingleCard(this.currentPlayer);

      this.gameState.discardPlayerCard(chosenCardUuid, this.currentPlayer);

      this.gameState.placeCardIntoDeckAndReceiveAnother(revealedUuid, this.targetPlayer);
    } else {
      console.log('The card is not Consessa');

      // Block failed: target loses both cards
      this.discardAllTargetPlayerCards();
    }
  }

  private discardAllTargetPlayerCards() {
    const cards = this.targetPlayer.getCards();

    cards.forEach((card) => {
      this.gameState.discardPlayerCard(card.uuid, this.targetPlayer);
    });
  }

  private async handleClaimChallenge(): Promise<void> {
    // Current player reveals a card
    const revealUuid = await this.promptService.askSingleCard(this.currentPlayer);

    const revealedCard = this.currentPlayer.getCardByUUID(revealUuid);

    if (revealedCard.variant === CARD_VARIANT_ASSASSIN) {
      // Challenge failed: challenger loses one card and current player exchanges Assassin
      this.discardAllTargetPlayerCards();

      this.gameState.placeCardIntoDeckAndReceiveAnother(revealUuid, this.currentPlayer);
    } else {
      this.gameState.discardPlayerCard(revealUuid, this.currentPlayer);
    }
  }
}
