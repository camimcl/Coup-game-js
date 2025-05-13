import BaseCase from './BaseCase.ts';
import { PROMPT_OPTION_CHALLENGE_ACCEPT } from '../constants/promptOptions.ts';
import { CARD_VARIANT_AMBASSADOR } from '../constants/cardVariants.ts';
import GameState from '../core/GameState.ts';

export default class AmbassadorCase extends BaseCase {
  constructor(gameState: GameState) {
    super('Embassador', gameState);
  }

  public async runCase(): Promise<void> {
    this.currentPlayer = this.gameState.getCurrentTurnPlayer();

    const {
      challengerId,
      response,
    } = await this.promptService.challengeOthers(
      this.currentPlayer.socket,
      this.gameState.getActivePlayers().length,
      `${this.currentPlayer.name} diz ser o embaixador e deseja trocar de cartas`,
    );

    if (response === PROMPT_OPTION_CHALLENGE_ACCEPT) {
      await this.handleChallenge(challengerId);
    } else {
      await this.performExchange();
    }

    this.finishTurn();
  }

  private async handleChallenge(challengerId: string) {
    const challenger = this.gameState.getPlayerByUUID(challengerId);

    const revealedUUID = await this.promptService.askSingleCard(
      this.currentPlayer,
    );

    const revealedCard = this.currentPlayer.getCardByUUID(revealedUUID);

    // Check if the revealed card is the ambassador
    if (revealedCard.variant !== CARD_VARIANT_AMBASSADOR) {
      this.gameState.discardPlayerCard(revealedUUID, this.currentPlayer);

      return;
    }

    // If the revealed card is the ambassador, the challenger must discard a card
    const challengerCardUUID = await this.promptService.askSingleCard(challenger);

    this.gameState.discardPlayerCard(challengerCardUUID, challenger);

    // currentPlayer returns the ambassador card for replace
    this.gameState.placeCardIntoDeckAndReceiveAnother(revealedUUID, this.currentPlayer);

    await this.performExchange();
  }

  private async performExchange() {
    // draw two cards from the deck
    const drawn1 = this.gameState.getDeck().draw();
    const drawn2 = this.gameState.getDeck().draw();

    // add the cards to the player
    this.currentPlayer.addCard(drawn1);
    this.currentPlayer.addCard(drawn2);

    // colect all the actual cards after the draw
    const totalCards = this.currentPlayer.getCardsClone();

    // keep the choosen cards
    const keptCardsUUIDs = await this.promptService.askTwoCards(this.currentPlayer);

    // remove the cards that were not kept
    totalCards.forEach((card) => {
      if (!keptCardsUUIDs.includes(card.uuid)) {
        this.currentPlayer.removeCardByUUID(card.uuid);

        this.gameState.getDeck().pushAndShuffle(card);
      }
    });
  }
}
