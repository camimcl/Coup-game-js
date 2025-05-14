import React from 'react';
import { useGameState } from '../../contexts/GameStateProvider';

import BackCardImage from '../../assets/images/backcard.png';

const renderCards = (cardsCount: number) =>
  Array.from({ length: cardsCount }).map((_, i) => (
    <div className="card-back" key={i} style={{ backgroundImage: `url(${BackCardImage})` }} />
  ));


/**
 * Renders the players area of the match dashboard,
 * showing connected players around the table.
 */
const Players: React.FC = () => {
  const { gameState } = useGameState();

  if (!gameState) {
    return <div id="players">No players in match</div>
  }

  return (
    <div id="players">
      {
        gameState.players.map((player) => (
          <div key={player.uuid} className='player'>
            <span className='player-name'>{player.name}</span>
            {
              renderCards(player.cardsCount)
            }
          </div>
        ))
      }
    </div>
  );
};

export default Players;
