import AmbassadorCase from './cases/AmbassadorCase.ts';
import AssassinCase from './cases/AssassinCase.ts';
import CoupCase from './cases/CoupCase.ts';
import CaptainCase from './cases/CaptainCase.ts';
import DukeCase from './cases/DukeCase.ts';
import ForeignAidCase from './cases/ForeignAidCase.ts';
import IncomeCase from './cases/IncomeCase.ts';
import Player from './core/entities/Player.ts';
import Match from './core/Match.ts';
import {
  GAME_START, MESSAGE, TURN_START, PROMPT_RESPONSE, CARD_DISCARDED
} from './constants/events.ts';
import BaseCase from './cases/BaseCase.ts';
import { PromptOption, PromptService } from './cases/PromptService.ts';

/**
 * @param match
 */
export default function initializeNamespace(match: Match) {
  const namespace = match.getNamespace();
  const gameState = match.getGameState();
  const promptService = new PromptService(namespace);
  
  const actionCases = {
    assassin: new AssassinCase(gameState),
    duke: new DukeCase(gameState),
    income: new IncomeCase(gameState),
    ambassador: new AmbassadorCase(gameState),
    coup: new CoupCase(gameState),
    foreignAid: new ForeignAidCase(gameState),
    captain: new CaptainCase(gameState)
  };
  
  const cases: { [key: string]: BaseCase } = Object.fromEntries(
    Object.values(actionCases).map(c => [c.getCaseName(), c])
  );

  namespace.on('connection', (socket) => {
    const username = (socket.handshake.auth.username || socket.id) as string;
    
    match.addPlayer(new Player(username, socket));
    console.log(`🎭 Player ${username} has joined the stage ${namespace.name}!`);
    
    socket.on('disconnect', () => {
      console.log(`🎭 Player ${username} has left the stage ${namespace.name}`);
      match.removePlayer(socket.id);
    });
    
    gameState.onCardDiscarded((playerId, cardId) => {
      namespace.emit(CARD_DISCARDED, { 
        playerId, 
        cardId,
        message: `Player descartou uma carta`
      });
      
      if (socket.id === playerId) {
        socket.emit(CARD_DISCARDED, { cardId });
      }
    });
  });

  async function handleTurn() {
    try {
      const currentPlayer = gameState.getCurrentTurnPlayer();
      
      const availableOptions: PromptOption[] = Object.values(cases)
        .filter((c) => c.canExecute())
        .map((c) => ({ 
          label: c.getCaseName(), 
          value: c.getCaseName() 
        }));
      
      if (!currentPlayer || !currentPlayer.socket) {
        console.warn('⚠️ No valid current player found, skipping turn');
        return;
      }
      
      const promptInterval = setInterval(() => {
        promptService.emitToPlayer(
          currentPlayer.socket,
          '🎭 O que deseja fazer neste turno?',
          availableOptions,
        );
      }, 3000);
      
      promptService.emitToPlayer(
        currentPlayer.socket,
        '🎭 O que deseja fazer neste turno?',
        availableOptions,
      );
      
      const response = await Promise.race([
        new Promise<string>((resolve) => {
          currentPlayer.socket.once(PROMPT_RESPONSE, (res: string) => {
            clearInterval(promptInterval);
            resolve(res);
          });
        }),
        
        new Promise<string>((resolve) => {
          setTimeout(() => {
            clearInterval(promptInterval);
            currentPlayer.socket.emit(MESSAGE, { 
              message: '⏰ Tempo esgotado! Selecionando renda (income) automaticamente' 
            });
            resolve('income');
          }, 45000);
        })
      ]);
      
      const chosenCase = cases[response];
      
      if (!chosenCase || !chosenCase.canExecute()) {
        currentPlayer.socket.emit(MESSAGE, { 
          message: '❌ Esta ação não está disponível no momento' 
        });
        
        if (cases['income'].canExecute()) {
          console.log(`🎮 Player ${currentPlayer.name} made invalid choice, defaulting to income`);
          cases['income'].runCase();
        }
      } else {
        console.log(`🎮 Player ${currentPlayer.name} chose action: ${response}`);
        chosenCase.runCase();
      }
    } catch (error) {
      console.error('🔥 Error handling turn:', error);
      match.internalBus.emit(TURN_START);
    }
  }

  match.internalBus.on(TURN_START, () => {
    console.debug('🎭 The curtain rises for the next turn!');
    handleTurn();
  });

  match.internalBus.on(GAME_START, () => {
    console.debug('🎪 The show begins! Game is starting...');
    handleTurn();
  });
}