// src/components/MatchDashboard/DiscardedCards.tsx
import React from 'react';
import { useGameState } from '../../contexts/GameStateProvider';

import AssassinCard from "../../assets/images/card_variant_assassin.png";
import DukeCard from "../../assets/images/card_variant_duke.png";
import CaptainCard from "../../assets/images/card_variant_captain.png";
import CondessaCard from "../../assets/images/card_variant_condessa.png";
import AmbassadorCard from "../../assets/images/card_variant_ambassador.png";
import { CARD_VARIANT_AMBASSADOR, CARD_VARIANT_ASSASSIN, CARD_VARIANT_CAPTAIN, CARD_VARIANT_CONDESSA, CARD_VARIANT_DUKE } from '../../constants/constants';

const CARDS = {
  [CARD_VARIANT_ASSASSIN]: AssassinCard,
  [CARD_VARIANT_CAPTAIN]: CaptainCard,
  [CARD_VARIANT_AMBASSADOR]: AmbassadorCard,
  [CARD_VARIANT_CONDESSA]: CondessaCard,
  [CARD_VARIANT_DUKE]: DukeCard
}

/**
 * Renders all known (discarded) cards grouped by variant and stacked.
 * Cards of the same variant are stacked with partial visibility.
 */
const DiscardedCards: React.FC = () => {
  const { gameState } = useGameState();

  if (!gameState) return null;

  const { knownCards } = gameState;

  // Group cards by variant
  const groupedCards = knownCards.reduce((acc, card) => {
    if (!acc[card.variant]) {
      acc[card.variant] = [];
    }
    acc[card.variant].push(card);
    return acc;
  }, {} as Record<string, typeof knownCards>);

  return (
    <div id="discarded-cards">
      <p>Cartas descartadas</p>

      <div className="flex flex-wrap gap-4 p-2">
        {Object.entries(groupedCards).map(([variant, cards]) => (
          <div key={variant} className="relative" style={{ width: "100px", height: "140px" }}>
            {cards.map((card, idx) => (
              <img
                key={idx}
                src={CARDS[variant]}
                alt={variant}
                style={{
                  position: "absolute",
                  top: `${idx * 20}px`, // Offset each card slightly
                  left: `${idx * 5}px`,
                  width: "100px",
                  height: "140px",
                  zIndex: idx
                }}
                className="object-contain"
              />
            ))}
            <span className="absolute bottom-0 right-0 bg-white text-black text-xs px-1 rounded">
              {cards.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscardedCards;
