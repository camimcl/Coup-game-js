// src/components/MatchDashboard/Players.tsx
import React from 'react';
import { useGameState } from '../../contexts/GameStateProvider';
import { useSocketContext } from '../../contexts/SocketProvider';

/**
 * Tailwind bg-color classes for up to 10 players.
 * The index of the player maps directly to one of these.
 */
const PLAYER_BG_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-gray-500',
  'bg-teal-500',
  'bg-orange-500',
];

/**
 * Displays all players side by side, each in its own colored container.
 * Shows coin and card counts using icons.
 */
const Players: React.FC = () => {
  const { gameState } = useGameState();
  const {socket} = useSocketContext();

  if (!gameState || !socket) return null;

  const { players } = gameState;

  return (
    <div
      id="players"
      className="flex gap-4 justify-center items-start p-2 overflow-x-auto"
    >
      {players.map((player, idx) => {
        if (player.uuid === socket.id) return;

        const bg = PLAYER_BG_COLORS[idx % PLAYER_BG_COLORS.length];

        return (
          <div
            key={player.uuid}
            className={`
              flex flex-col items-center
              p-4 rounded-lg shadow
              ${bg} text-white
            `}
          >
            <span className="text-sm font-semibold mb-2">
              {player.name}
            </span>

            <div className="flex items-center space-x-1">
              <span className="text-sm">Moedas: {player.coins}</span>
            </div>

            <div className="flex items-center space-x-1 mt-1">
              <span className="text-sm">Cartas: {player.cardsCount}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Players;
