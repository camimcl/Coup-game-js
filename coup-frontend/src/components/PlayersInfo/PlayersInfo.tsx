import React, { useState, useEffect } from 'react';
import './PlayersInfo.scss';
import { GAME_STATE_UPDATE } from '../../events';
import { useSocketContext } from '../../contexts/SocketProvider.tsx';

// Define the shape of a player in the game state
interface PlayerInfo {
  uuid: string;
  name: string;
  cards: number;       // number of cards the player holds
  isCurrent: boolean;  // true for the current (local) player
}

/**
 * Calculates the position around a circle for a given index
 * @param index - index of the player in the filtered list
 * @param total - total number of players (excluding current)
 * @returns x/y percentages for CSS positioning
 */
function calculatePosition(index: number, total: number): { left: string; top: string } {
  const angle = (index * 360) / total - 90; // start at top (-90deg)
  const radians = (angle * Math.PI) / 180;
  const radius = 45; // percentage of container radius
  const left = 50 + Math.cos(radians) * radius;
  const top = 50 + Math.sin(radians) * radius;
  return { left: `${left}%`, top: `${top}%` };
}

export default function PlayersInfo() {
  const { socket } = useSocketContext();
  const [others, setOthers] = useState<PlayerInfo[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Handler for game state updates
    const handleGameState = (state: { players: PlayerInfo[] }) => {
      // Filter out the current player
      const nonCurrent = state.players.filter(p => !p.isCurrent);
      setOthers(nonCurrent);
    };

    // Listen for updates
    socket.on(GAME_STATE_UPDATE, handleGameState);

    // Cleanup listener on unmount
    return () => {
      socket.off(GAME_STATE_UPDATE, handleGameState);
    };
  }, [socket]);

  /**
   * Renders card back placeholders
   * @param count - number of cards
   */
  const renderCards = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <div className="card-back" key={i} />
    ));

  return (
    <div className="players-around-container">
      {others.map((player, idx) => {
        const pos = calculatePosition(idx, others.length);
        return (
          <div
            key={idx}
            className="player-item"
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="player-name">{player.name}</div>
            <div className="player-cards">{renderCards(player.cards)}</div>
          </div>
        );
      })}
    </div>
  );
}
