import AmbassadorCase from './cases/AmbassadorCase.ts';
import AssassinCase from './cases/AssassinCase.ts';
import CoupCase from './cases/CoupCase.ts';
import CaptainCase from './cases/CaptainCase.ts';
import DukeCase from './cases/DukeCase.ts';
import ForeignAidCase from './cases/ForeignAidCase.ts';
import IncomeCase from './cases/IncomeCase.ts';
import Player from './core/entities/Player.ts';
import Match from './core/Match.ts';

export default function initializeNamespace(
  match: Match,
) {
  const namespace = match.getNamespace();

  namespace.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Player ${socket.id} has joined the room ${namespace.name}`);

    match.addPlayer(new Player(socket.id, socket));

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Player ${socket.id} has left the room ${namespace.name}`);
    });

    socket.on('DUKE', () => {
      const dukeCase = new DukeCase(match.getGameState());

      dukeCase.tax();
    });

    socket.on('ASSASSIN', () => {
      const assassinCase = new AssassinCase(match.getGameState());

      assassinCase.execute();
    });
    socket.on('INCOME', () => {
      const incomeCase = new IncomeCase(match.getGameState());

      incomeCase.getIncome();
    });

    socket.on('EXCHANGE', () => {
      const ambassadorCase = new AmbassadorCase(match.getGameState());

      ambassadorCase.exchangeCards();
    });
    socket.on('COUP', () => {
      const coupCase = new CoupCase(match.getGameState());

      coupCase.execute();
    });
    socket.on('FOREIGN_AID', () => {
      const foreignAidCase = new ForeignAidCase(match.getGameState());

      foreignAidCase.askForeignAid();
    });
    socket.on('STEAL_COINS', () => {
      const ambassadorCase = new CaptainCase(match.getGameState());

      ambassadorCase.stealTwoCoins();
    });
  });
}
