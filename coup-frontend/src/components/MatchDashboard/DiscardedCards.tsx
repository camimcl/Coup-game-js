import React from 'react';

interface DiscardedCardsProps {
  /** List of discarded cards */
}

 /**
  * Displays cards that have been discarded during the match.
  */
const DiscardedCards: React.FC<DiscardedCardsProps> = () => {
  return (
    <div id="discarded-cards">
      {/* TODO: render discarded cards */}
    </div>
  );
};

export default DiscardedCards;
