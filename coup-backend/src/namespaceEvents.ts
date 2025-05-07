import DukeCase from './cases/DukeCase.ts';
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
  });
}
