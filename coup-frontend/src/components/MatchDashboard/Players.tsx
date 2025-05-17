import React from 'react';
import { useGameState } from '../../contexts/GameStateProvider';
import { useSocketContext } from '../../contexts/SocketProvider';
import './Players.css';

const Players: React.FC = () => {
  const { gameState } = useGameState();
  const { socket } = useSocketContext();

  if (!gameState || !socket) return null;

  const { players } = gameState;
  const currentPlayerId = gameState.currentPlayer;

  const otherPlayers = players.filter(player => player.uuid !== socket.id);

  return (
    <div id="players" className="players-showcase">
      <div className="players-title">
        <span className="title-decoration">♠</span>
        OPONENTES
        <span className="title-decoration">♠</span>
      </div>
      
      <div className="players-grid">
        {otherPlayers.map((player, idx) => {
          const isCurrentTurn = player.uuid === currentPlayerId;
          
          return (
            <div 
              key={player.uuid}
              className={`player-card ${isCurrentTurn ? 'current-turn' : ''}`}
            >
              <div className="player-avatar">
                <div className="avatar-bg">
                  {player.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="player-info">
                <div className="player-name">
                  {player.name}
                </div>
                
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-number">{player.coins}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-icon">🃏</span>
                    <span className="stat-number">{player.cardsCount}</span>
                  </div>
                </div>
              </div>
              
              {isCurrentTurn && (
                <div className="turn-indicator">VEZ</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Players;