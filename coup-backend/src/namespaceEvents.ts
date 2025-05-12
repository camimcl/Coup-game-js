import { EventEmitter } from 'events';
import AmbassadorCase from './cases/AmbassadorCase.ts';
import AssassinCase from './cases/AssassinCase.ts';
import CoupCase from './cases/CoupCase.ts';
import CaptainCase from './cases/CaptainCase.ts';
import DukeCase from './cases/DukeCase.ts';
import ForeignAidCase from './cases/ForeignAidCase.ts';
import IncomeCase from './cases/IncomeCase.ts';
import Player from './core/entities/Player.ts';
import Match from './core/Match.ts';
import { GAME_START, NEXT_TURN } from './constants/events.ts';
import { emitPromptToPlayer, PromptOption } from './cases/utils.ts';


export default function initializeNamespace(
  match: Match,
) {
  const namespace = match.getNamespace();
  const gameState = match.getGameState();

  const assassinCase = new AssassinCase(gameState);
  const dukeCase = new DukeCase(gameState);
  const incomeCase = new IncomeCase(gameState);
  const ambassadorCase = new AmbassadorCase(gameState);
  const coupCase = new CoupCase(gameState);
  const foreignAidCase = new ForeignAidCase(gameState);
  const captainCase = new CaptainCase(gameState);

  const cases = [
    ambassadorCase,
    assassinCase,
    captainCase,
    coupCase,
    dukeCase,
    foreignAidCase,
    incomeCase,
  ];

  namespace.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Player ${socket.id} has joined the room ${namespace.name}`);

    match.addPlayer(new Player(socket.id, socket));

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Player ${socket.id} has left the room ${namespace.name}`);
    });
  });

  function startTurn() {
    const availableOptions: PromptOption[] = cases
      .filter((c) => c.canExecute())
      .map((c) => ({ label: c.getCaseName(), value: c.getCaseName() }));

    const player = match.getGameState().getCurrentTurnPlayer();

    emitPromptToPlayer({
      message: 'O que deseja fazer',
      namespace,
      options: availableOptions,
      socket: player.socket,
    });
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
