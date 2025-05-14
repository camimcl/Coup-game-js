import React, { useState, useEffect } from 'react';
import './PlayersInfo.scss';
import { GAME_STATE_UPDATE } from '../../events';
import { useSocketContext } from '../../contexts/SocketProvider.tsx';
import { useGameState, type PlayerInfo } from '../../contexts/GameStateProvider.tsx';

import BackCardImage from '../../assets/images/backcard.png';

/**
 * Calculates the position around a circle for a given index
 * @param index - index of the player in the filtered list
 * @param total - total number of players (excluding current)
 * @returns x/y percentages for CSS positioning
 */
function calculatePosition(index: number, total: number): { left: string; top: string } {
  const angle = (index * 360) / total - 90;
  const radians = (angle * Math.PI) / 180;
  const radius = 45;
  const left = 50 + Math.cos(radians) * radius;
  const top = 50 + Math.sin(radians) * radius;

  return { left: `${left}%`, top: `${top}%` };
}

export default function PlayersInfo() {
  const { socket } = useSocketContext();
  const { gameState } = useGameState();
  const [others, setOthers] = useState<PlayerInfo[]>([]);

  useEffect(() => {
    if (!socket || !gameState) return;

    const nonCurrent = gameState.players.filter(p => p.uuid !== socket.id);

    setOthers(nonCurrent);
  }, [socket, gameState]);

  /**
   * Renders card back placeholders
   * @param count - number of cards
   */
  const renderCards = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <div className="card-back" key={i} style={{ backgroundImage: `url(${BackCardImage})` }} />
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
            <div className="player-cards">{renderCards(player.cardsCount)}</div>
          </div>
        );
      })}
    </div>
  );
}
