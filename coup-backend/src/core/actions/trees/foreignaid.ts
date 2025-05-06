import {
    getChallengeNode, getChooseOwnedCardNode, getDecisionNode, getNextTurnActionNode,
  } from '../../nodes/CommonNodes';
  import {
    DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE,
  } from '../events';
import GameState from '../../GameState';
import ActionNode from '../../nodes/ActionNode';
import emitPrompt, { OWNED_CARDS_CHOICE } from '../eventsUtil';

const getForeignAidNode = new ActionNode<GameState>(
    
  async (gameState, namespaceServer) => {
    // Add 2 coins to the player's total
    gameState.getCurrentPlayer().coins += 2;
    console.log(gameState.getCurrentPlayer().coins);

    // Notify the player
    namespaceServer.emit('MESSAGE', 'Você ganhou 2 moedas!');

    // End the turn after the action
    namespaceServer.emit('END_TURN');
  }
    , getNextTurnActionNode()
);

const discardPlayer1Card = new ActionNode<GameState>((ctx) => {
  console.log('Player 1 discards one card');
}
, getNextTurnActionNode()
);

const discardPlayer2Card = new ActionNode<GameState>((ctx) => {
  console.log('Player 2 discards one card'),
  getForeignAidNode;
});

const checkDuqueNode = getDecisionNode({
    isConditionTrue: () => {
      console.log('Checking if card is duke');
  
      return true;
    },
    onFalseNode: discardPlayer2Card,
    onTrueNode: discardPlayer1Card,
  });

const chooseDuqueCardNode = getChooseOwnedCardNode({
    onCardChosenNode: checkDuqueNode,
    sendPrompt: (_, namespaceServer) => {
        emitPrompt({
            namespaceServer,
            message: 'Blz player2, mostra ai tua carta',
            variant: OWNED_CARDS_CHOICE,
        });
    },
});

const blockForeignAidNode = getChallengeNode({
    onChallengedNode: chooseDuqueCardNode,
    onPassedNode: getNextTurnActionNode(),
    sendPrompt: (_, namespaceServer) => {
      emitPrompt({
        namespaceServer,
        message: 'Player2, esta dizendo que eh o duque e voce nao pode pedir ajuda externa',
        targetUUIDs: [],
        options: ['Deixar passar', 'Desafiar'],
        optionsEvents: [
            IGNORE_PUBLIC_CHALLENGE, 
            DO_PUBLIC_CHALLENGE
        ],
      });
    }
});

export default getChallengeNode({
  onChallengedNode: blockForeignAidNode,
  onPassedNode: getForeignAidNode,
  sendPrompt: (_, namespaceServer) => {
      emitPrompt({
        namespaceServer,
        message: 'Fulano esta pedindo ajuda externa',
        options: ['Aceitar', 'Desafiar'],
        optionsEvents: [
            IGNORE_PUBLIC_CHALLENGE, 
            DO_PUBLIC_CHALLENGE
        ],
      });
  }
});