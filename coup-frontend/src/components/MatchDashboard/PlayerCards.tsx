import React from 'react';

interface PlayerCardsProps {
  /** Cards currently held by the active player */
}

 /**
  * Renders the current player's cards (face-down backs).
  */
const PlayerCards: React.FC<PlayerCardsProps> = () => {
  return (
    <div id="player-cards">
      {/* TODO: render card backs for this player */}
    </div>
  );
};

export default PlayerCards;
