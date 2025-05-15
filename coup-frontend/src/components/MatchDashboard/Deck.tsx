// src/components/MatchDashboard/Deck.tsx
import React from 'react';
import { useGameState } from '../../contexts/GameStateProvider';

/**
 * CSS classes to stagger rotation and offset for each stacked card.
 */
const rotationClasses = ['-rotate-3', '-rotate-1', 'rotate-1', 'rotate-2', 'rotate-3'];
const offsetXClasses   = ['translate-x-0', 'translate-x-1', 'translate-x-2', 'translate-x-3', 'translate-x-4'];
const offsetYClasses   = ['translate-y-0', '-translate-y-1', '-translate-y-2', '-translate-y-3', '-translate-y-4'];

/**
 * Renders the draw deck as a small stack of overlapping cards.
 * Shows up to 5 card backs with incremental tilt/offset; if the deck is larger,
 * displays a “+N” badge for the remainder.
 */
const Deck: React.FC = () => {
  const { gameState } = useGameState();

  if (!gameState) return null;

  const { deckSize } = gameState;

  // Only visually show up to this many cards in the stack:
  const maxVisible = 5;
  const cardsToShow = Math.min(deckSize, maxVisible);

  return (
    <div
      id="deck"
      className="relative w-16 h-24"
      aria-label={`Deck (${deckSize} cards remaining)`}
    >
      {Array.from({ length: cardsToShow }).map((_, i) => (
        <div
          key={i}
          className={`
            absolute top-0 left-0
            w-full h-full
            bg-gray-800 rounded-lg shadow-md
            transform
            ${rotationClasses[i % rotationClasses.length]}
            ${offsetXClasses[i]}
            ${offsetYClasses[i]}
          `}
          style={{ zIndex: i }}
        />
      ))}

      {deckSize > maxVisible && (
        <div className="
            absolute bottom-1 right-1
            bg-black bg-opacity-50
            text-white text-xs font-bold
            px-1 rounded
          ">
          +{deckSize - maxVisible}
        </div>
      )}
    </div>
  );
};

export default Deck;
