import React from 'react';

interface DeckProps {
  /** Remaining cards count or deck state */
}

 /**
  * Shows the draw deck in the center of the board.
  */
const Deck: React.FC<DeckProps> = () => {
  return (
    <div id="deck">
      {/* TODO: render deck back and count */}
    </div>
  );
};

export default Deck;
