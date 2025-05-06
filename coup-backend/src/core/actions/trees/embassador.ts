import GameState from '../../GameState';
import ActionNode from '../../nodes/ActionNode';
import {
  getChallengeNode, getChooseOwnedCardNode, getDecisionNode, getNextTurnActionNode,
} from '../../nodes/CommonNodes';
import {
  DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE,
} from '../events';
import emitPrompt, {  OWNED_CARDS_CHOICE } from '../eventsUtil';

const giveTwoCardsToPlayer1Node = new ActionNode<GameState>((ctx) => {
  console.log('Giving two cards to player 1');
  // Give two cards to the player
});
 
const giveThreeCardsToPlayer1Node = new ActionNode<GameState>((ctx) => {
  // Give two cards to the player
}, getNextTurnActionNode());

const discardPlayer1Card = new ActionNode<GameState>((ctx) => {
  // The action (get two cards) is not performed and the player1 discards the showed card
});

const discardPlayer2Card = new ActionNode<GameState>((ctx) => {
  console.log('Player 2 discards one card');
}, giveThreeCardsToPlayer1Node);

const askChallengerToChooseCardNode = getChooseOwnedCardNode({
  onCardChosenNode: discardPlayer2Card,
  sendPrompt: (_, namespaceServer) => {
    emitPrompt({
      namespaceServer,
      message: 'Choose a card to discard',
      variant: OWNED_CARDS_CHOICE,
    });
  },
});

const checkEmabassadorNode = getDecisionNode({
  isConditionTrue: () => {
    console.log('Checking if card is embassador');

    return true;
  },
  onFalseNode: discardPlayer1Card,
  onTrueNode: askChallengerToChooseCardNode,
});

const chooseEmbassadorCardNode = getChooseOwnedCardNode({
  onCardChosenNode: checkEmabassadorNode,
  sendPrompt: (_, namespaceServer) => {
    emitPrompt({
      namespaceServer,
      message: 'Voce esta sendo desafiado como embaixador, que carta deseja mostrar?',
      variant: OWNED_CARDS_CHOICE,
    });
  },
});

export default getChallengeNode({
  onChallengedNode: chooseEmbassadorCardNode,
  onPassedNode: giveTwoCardsToPlayer1Node,
  sendPrompt: (_, namespaceServer) => {
    emitPrompt({
      namespaceServer,
      message: 'Fulano se diz embaixador e quer duas cartas do deck',
      options: ['Desafiar', 'Passar'],
      optionsEvents: [
        DO_PUBLIC_CHALLENGE,
        IGNORE_PUBLIC_CHALLENGE,
      ],
    });
  },
});
