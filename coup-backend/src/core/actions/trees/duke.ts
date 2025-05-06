import ActionNode from "../../nodes/ActionNode";
import GameState from '../../GameState';
import { getChallengeNode, getChooseOwnedCardNode, getDecisionNode, getNewCardNode, getNextTurnActionNode } from "../../nodes/CommonNodes";
import { DO_PUBLIC_CHALLENGE, IGNORE_PUBLIC_CHALLENGE } from "../events";
import emitPrompt, { OWNED_CARDS_CHOICE } from "../eventsUtil";

const dukeActionNode = new ActionNode<GameState>(

    async (gameState, namespaceServer) => {
        gameState.getCurrentPlayer().coins += 3;
        console.log(gameState.getCurrentPlayer().coins);

        namespaceServer.emit('MESSAGE', 'Você ganhou 3 moedas!');
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
    dukeActionNode,
    getNewCardNode();
});


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


const checkDukeNode = getDecisionNode({
  isConditionTrue: () => {
    console.log('Checking if card is duke');

    return true;
  },
  onFalseNode: discardPlayer1Card,
  onTrueNode: askChallengerToChooseCardNode,
}); 

const chooseDukeCardNode = getChooseOwnedCardNode({
  onCardChosenNode: checkDukeNode,
  sendPrompt: (_, namespaceServer) => {
    emitPrompt({
      namespaceServer,
      message: 'Voce esta sendo desafiado como duque, que carta deseja mostrar?',
      variant: OWNED_CARDS_CHOICE,
    });
  },
});

export default getChallengeNode({
    onChallengedNode:chooseDukeCardNode,
    onPassedNode: dukeActionNode,
    sendPrompt: (_, namespaceServer) => {
        emitPrompt({
            namespaceServer,
            message: 'Jogador diz ser o duque e quer 3 moedas',
            options: [ 'Aceitar', 'Desafiar'],
            targetUUIDs: [],
            optionsEvents: [
                IGNORE_PUBLIC_CHALLENGE,
                DO_PUBLIC_CHALLENGE 
            ]
        });
    }
})