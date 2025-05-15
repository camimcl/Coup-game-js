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
 * Renders all known (discarded) cards side by side.
 * If they would overflow, each card is shrunk to fit evenly.
 */
const DiscardedCards: React.FC = () => {
  const { gameState } = useGameState();

  if (!gameState) return null;

  const { knownCards } = gameState;
  const count = knownCards.length;
  const gapPx = 8; // corresponds to Tailwind 'gap-2'
  const cardWidth = count > 0
    ? `calc((100% - ${(count - 1) * gapPx}px) / ${count})`
    : '0';

  return (
    <div
      id="discarded-cards"
    >
      <p>Cartas descartadas</p>

      <div
        className="flex items-center gap-2 overflow-hidden p-2"
      >
        {knownCards.map((card, idx) => (
          <img
            key={idx}
            src={CARDS[card.variant]}
            alt={card.variant}
            style={{ width: cardWidth, maxWidth: "100px" }}
            className="object-contain flex-shrink-0"
          />
        ))}

      </div>
    </div>
  );
};

export default DiscardedCards;
