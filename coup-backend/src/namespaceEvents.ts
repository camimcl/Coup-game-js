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
  GAME_START, MESSAGE, NEXT_TURN, PROMPT_RESPONSE,
} from './constants/events.ts';
import BaseCase from './cases/BaseCase.ts';
import { PromptService } from './cases/PromptService.ts';

export default function initializeNamespace(
  match: Match,
) {
  const namespace = match.getNamespace();
  const gameState = match.getGameState();
  const promptService = new PromptService(namespace);

  const assassinCase = new AssassinCase(gameState);
  const dukeCase = new DukeCase(gameState);
  const incomeCase = new IncomeCase(gameState);
  const ambassadorCase = new AmbassadorCase(gameState);
  const coupCase = new CoupCase(gameState);
  const foreignAidCase = new ForeignAidCase(gameState);
  const captainCase = new CaptainCase(gameState);

  const cases: { [key: string]: BaseCase } = {
    [assassinCase.getCaseName()]: assassinCase,
    [dukeCase.getCaseName()]: dukeCase,
    [incomeCase.getCaseName()]: incomeCase,
    [ambassadorCase.getCaseName()]: ambassadorCase,
    [coupCase.getCaseName()]: coupCase,
    [foreignAidCase.getCaseName()]: foreignAidCase,
    [captainCase.getCaseName()]: captainCase,
  };

  namespace.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Player ${socket.id} has joined the room ${namespace.name}`);

    match.addPlayer(new Player(socket.id, socket));

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Player ${socket.id} has left the room ${namespace.name}`);

      match.removePlayer(socket.id);
    });
  });

  async function startTurn() {
    const availableOptions: PromptOption[] = Object.values(cases)
      .filter((c) => c.canExecute())
      .map((c) => ({ label: c.getCaseName(), value: c.getCaseName() }));

    const player = match.getGameState().getCurrentTurnPlayer();

    promptService.emitToPlayer(
      player.socket,
      'O que deseja fazer',
      availableOptions,
    );

    const response = await new Promise<string>((resolve) => {
      player.socket.once(PROMPT_RESPONSE, (res: string) => {
        resolve(res);
      });
    });

    const chosenCase = cases[response];

    if (!chosenCase || !chosenCase.canExecute()) {
      player.socket.emit(MESSAGE, { message: 'Cannot execute the given actions' });
    } else {
      chosenCase.runCase();
    }
  }

  match.internalBus.on(NEXT_TURN, () => {
    console.debug('Starting next turn');

    startTurn();
  });

  match.internalBus.on(GAME_START, () => {
    console.debug('Starting game');

    startTurn();
  });
}
