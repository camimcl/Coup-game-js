/* eslint-disable no-console */
import BaseCase from './BaseCase.ts';
import askPlayerToChooseCard from './utils.ts';
import Player from '../core/entities/Player.ts';
import { CARD_VARIANT_ASSASSIN, CARD_VARIANT_CONDESSA } from '../constants/cardVariants.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT, PROMPT_OPTION_CHALLENGE_PASS } from '../constants/promptOptions.ts';
import GameState from '../core/GameState.ts';

/**
 * Handles the Assassin action:
 * a player pays 3 coins to attempt to eliminate one influence from another player.
 */
export default class AssassinCase extends BaseCase {
  /** The player being targeted for assassination. */
  private targetPlayer!: Player;

  constructor(gameState: GameState) {
    super('Kill', gameState);
  }

  public canExecute(): boolean {
    return this.gameState.getCurrentTurnPlayer().getCoinsAmount() >= 3 && super.canExecute();
  }

  /**
   * Orchestrates the full assassination sequence.
   */
  public async execute(): Promise<void> {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    this.verifyCoins();
    this.payCoins();

    // 1. Choose target to assassinate
    await this.promptChooseTarget();

    // 2. Target decides to Challenge, block with Condessa or accept
    const defenseChoice = await this.promptTargetDefense();

    console.log(`Defense choice ${defenseChoice}`);

    if (defenseChoice === 'ACCEPT') {
      // Target accepts assassination
      await this.applyAssassination();
    } else if (defenseChoice === 'BLOCK') {
      // Target claims Condessa: handle block flow
      await this.handleCondessaBlock();
    } else {
      // Someone challenged the claim
      await this.handleClaimChallenge();
    }

    this.finishTurn();
  }

  /**
   * Ensures the current player has at least three coins.
   */
  private verifyCoins(): void {
    if (this.currentPlayer.getCoinsAmount() < 3) {
      throw new Error('Você precisa ter pelo menos 3 moedas para assassinar.');
    }
  }

  /**
   * Deducts three coins from the current player.
   */
  private payCoins(): void {
    console.debug(`${this.currentPlayer.name} paga 3 moedas para assassinar.`);
    this.currentPlayer.removeCoins(3);
  }

  /**
   * Prompts the current player to select a target.
   */
  private async promptChooseTarget(): Promise<void> {
    const options = this.gameState
      .getActivePlayers()
      .filter((p) => p.uuid !== this.currentPlayer.uuid)
      .map((p) => ({ label: p.name, value: p.uuid }));

    const chosenUuid: string = await this.emitPromptToPlayer({
      defaultOption: options[0],
      message: 'Escolha um jogador para assassinar',
      targetSocket: this.currentPlayer.socket,
      options,
    });

    console.log(`Chosen target: ${chosenUuid}`);

    const target = this.gameState.getPlayerByUUID(chosenUuid);
    if (!target) throw new Error('Jogador alvo não encontrado.');
    this.targetPlayer = target;
  }

  /**
   * Asks the target player whether they accept the assassination or defend with Condessa.
   * Returns 'ACCEPT' if they accept, or 'BLOCK' if they claim Condessa.
   */
  private async promptTargetDefense(): Promise<string> {
    const options = [
      { label: 'Aceitar assassinato', value: 'ACCEPT' },
      { label: 'Desafiar', value: PROMPT_OPTION_CHALLENGE_ACCEPT },
      { label: 'Dizer que é a Condessa', value: 'BLOCK' },
    ];

    return this.emitPromptToPlayer({
      defaultOption: options[0],
      message: `${this.currentPlayer.name} está tentando te assassinar. O que você deseja fazer?`,
      options,
      targetSocket: this.targetPlayer.socket,
    });
  }

  /**
   * Applies the assassination effect: target chooses a card to discard.
   */
  private async applyAssassination(): Promise<void> {
    const namespace = this.gameState.getNamespace();

    const uuid = await askPlayerToChooseCard(namespace, this.targetPlayer);

    console.log(`Discarding card ${uuid} from player ${this.targetPlayer.name}`);

    this.gameState.discardPlayerCard(uuid, this.targetPlayer);
  }

  /**
   * Handles the block by Condessa with possible challenge by other players.
   */
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

    const response = await this.emitPromptToPlayer({
      defaultOption: options[0],
      message: `${this.targetPlayer.name} diz ser a Condessa e bloqueia o assassinato. O que deseja fazer`,
      targetSocket: this.currentPlayer.socket,
      options,
    });

    if (response === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      console.log('Challenge accepted');

      await this.handleBlockChallenge();
    } else {
      console.log('Challenge not accepted, doing nothing and moving to the next turn.');
    }
  }

  /**
   * Resolves a challenge against the Condessa block claim.
   */
  private async handleBlockChallenge(): Promise<void> {
    const namespace = this.gameState.getNamespace();

    // Target reveals a card
    const revealedUuid = await askPlayerToChooseCard(namespace, this.targetPlayer);

    const revealed = this.targetPlayer.getCardByUUID(revealedUuid);

    if (revealed.variant === CARD_VARIANT_CONDESSA) {
      console.log('The card is Consessa');
      // Challenge failed: challenger loses both cards
      // TODO: ask challenger (currentPlayer) to discard one and discard it
      const chosenCardUuid = await askPlayerToChooseCard(namespace, this.currentPlayer);

      this.gameState.discardPlayerCard(chosenCardUuid, this.currentPlayer);
    } else {
      // Block failed: target loses both cards
      // TODO: ask target to discard two cards, one at a time
    }
  }

  /**
   * Resolves a challenge against the Assassin claim.
   * @param challengerId UUID of the challenger.
   */
  private async handleClaimChallenge(): Promise<void> {
    const namespace = this.gameState.getNamespace();

    // Current player reveals a card
    const revealUuid = await askPlayerToChooseCard(namespace, this.currentPlayer);
    const revealed = this.currentPlayer.getCardByUUID(revealUuid);

    if (revealed.variant === CARD_VARIANT_ASSASSIN) {
      // Challenge failed: challenger loses one card and current player exchanges Assassin
      const chosenCardUuid = await askPlayerToChooseCard(namespace, this.targetPlayer);

      this.gameState.discardPlayerCard(chosenCardUuid, this.targetPlayer);

      // TODO: Add card from deck to current player
    } else {
      this.gameState.discardPlayerCard(revealUuid, this.currentPlayer);
    }
  }
}
