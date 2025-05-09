/* eslint-disable no-console */
import { PROMPT_OPTION_CHALLENGE_ACCEPT } from '../constants/promptOptions.ts';
import askPlayerToChooseCard from './utils.ts';
import { CARD_VARIANT_ASSASSIN, CARD_VARIANT_DUKE } from '../constants/cardVariants.ts';
import Card from '../core/entities/Card.ts';
import Player from '../core/entities/Player.ts';
import BaseCase from './BaseCase.ts';

export default class DukeCase extends BaseCase {
  private challengerPlayer: Player | null = null;

  async tax() {
    const {
      challengerId,
      response: challengeResolution,
    } = await this.emitChallengeToOtherPlayers(`${this.currentPlayer.name} diz ser o Duque e requisita três moedas.`);

    if (challengeResolution === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      await this.handleChallenge(challengerId);
    } else {
      console.debug(`${this.currentPlayer.name} has won 3 coins because no one challenged them as Duke`);

      this.currentPlayer.addCoins(3);

      console.debug(`Now ${this.currentPlayer.name} has ${this.currentPlayer.getCoinsAmount()} coins`);
    }
  }

  private async handleChallenge(challengerId: string) {
    const namespace = this.gameState.getNamespace();

    this.challengerPlayer = this.gameState.getPlayerByUUID(challengerId);

    if (!this.challengerPlayer) {
      throw new Error('Player was not found. Finishing game');
    }

    console.debug(`${this.challengerPlayer.name} has challenged ${this.currentPlayer.name}`);

    console.debug(`${this.currentPlayer.name} must choose a card`);

    const currentPlayerChosenCardUUID = await askPlayerToChooseCard(namespace, this.currentPlayer);

    const chosenCard = this.currentPlayer.getCardByUUID(currentPlayerChosenCardUUID);

    if (chosenCard.variant !== CARD_VARIANT_DUKE) {
      console.debug('The chosen card is not Duke. Discarding the chosen card.');

      this.gameState.discardPlayerCardAndAddToDeck(currentPlayerChosenCardUUID, this.currentPlayer);

      // TODO: emit event to the current player saying that the card was discarded

      return;
    }

    console.debug(`The chosen card is Duke. The challenger player ${this.challengerPlayer.name} must choose a card to discard.`);

    const challengerChosenCardUUID = await askPlayerToChooseCard(namespace, this.challengerPlayer);

    console.debug('Discarding the chosen card.');

    this.gameState.discardPlayerCardAndAddToDeck(challengerChosenCardUUID, this.challengerPlayer);

    // TODO: emit event to the challenger player saying that the card was discarded

    console.debug(`${this.currentPlayer.name} receives a new card and discard the Duke card`);

    // TODO get the card from the deck.
    this.currentPlayer.addCard(new Card(CARD_VARIANT_ASSASSIN));

    // TODO: devemos descartar a carta primeiro, embaralhar o deck e pegar uma carta nova

    this.gameState.discardPlayerCardAndAddToDeck(currentPlayerChosenCardUUID, this.currentPlayer);

    console.debug(`Performing the Duke action and giving 3 coins to ${this.currentPlayer.name}`);

    this.currentPlayer.addCoins(3);

    console.debug(`Now ${this.currentPlayer.name} has ${this.currentPlayer.getCoinsAmount()} coins`);
  }
}
