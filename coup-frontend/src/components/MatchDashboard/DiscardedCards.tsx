import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../../contexts/GameStateProvider';
import AssassinCard from "../../assets/images/card_variant_assassin.png";
import DukeCard from "../../assets/images/card_variant_duke.png";
import CaptainCard from "../../assets/images/card_variant_captain.png";
import CondessaCard from "../../assets/images/card_variant_condessa.png";
import AmbassadorCard from "../../assets/images/card_variant_ambassador.png";
import { CARD_VARIANT_AMBASSADOR, CARD_VARIANT_ASSASSIN, CARD_VARIANT_CAPTAIN, CARD_VARIANT_CONDESSA, CARD_VARIANT_DUKE } from '../../constants/constants';
import './DiscardedCards.css';

const CARDS = {
  [CARD_VARIANT_ASSASSIN]: AssassinCard,
  [CARD_VARIANT_CAPTAIN]: CaptainCard,
  [CARD_VARIANT_AMBASSADOR]: AmbassadorCard,
  [CARD_VARIANT_CONDESSA]: CondessaCard,
  [CARD_VARIANT_DUKE]: DukeCard
};

const CARD_NAMES = {
  [CARD_VARIANT_ASSASSIN]: 'Assassin',
  [CARD_VARIANT_CAPTAIN]: 'Captain',
  [CARD_VARIANT_AMBASSADOR]: 'Ambassador',
  [CARD_VARIANT_CONDESSA]: 'Countess',
  [CARD_VARIANT_DUKE]: 'Duke'
};

const DiscardedCards: React.FC = () => {
  const { gameState } = useGameState();
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());
  const prevKnownCardsRef = useRef<Array<any>>([]);
  
  useEffect(() => {
    if (!gameState) return;
    
    if (prevKnownCardsRef.current.length === 0) {
      prevKnownCardsRef.current = [...gameState.knownCards];
      return;
    }
    
    const newCards = gameState.knownCards.filter(
      card => !prevKnownCardsRef.current.some(
        prevCard => prevCard.uuid === card.uuid
      )
    );
    
    if (newCards.length > 0) {
      const newAnimatedCards = new Set(animatedCards);
      newCards.forEach(card => newAnimatedCards.add(card.uuid));
      setAnimatedCards(newAnimatedCards);
      
      setTimeout(() => {
        setAnimatedCards(prev => {
          const updated = new Set(prev);
          newCards.forEach(card => updated.delete(card.uuid));
          return updated;
        });
      }, 1500);
    }
    
    prevKnownCardsRef.current = [...gameState.knownCards];
  }, [gameState?.knownCards]);

  if (!gameState) return null;
  
  const { knownCards } = gameState;
  const hasCards = knownCards.length > 0;
  
  return (
    <div id="discarded-cards" className="discarded-cards-container">
      <div className="discarded-platform">
        <div className="discard-spotlight"></div>
       
        <div className="discarded-header">
          <div className="header-ornament left-ornament">♠</div>
          <h3 className="discarded-title">
            Cartas Descartadas
            <span className="cards-count">{knownCards.length > 0 ? `(${knownCards.length})` : ''}</span>
          </h3>
          <div className="header-ornament right-ornament">♠</div>
        </div>
       
        <div className="discarded-cards-stage">
          {hasCards ? (
            <div className="cards-grid">
              {knownCards.map((card, idx) => (
                <div
                  key={card.uuid || idx}
                  className={`card-wrapper ${animatedCards.has(card.uuid) ? 'animate-drop' : ''}`}
                  style={{
                    '--card-index': idx,
                    '--total-cards': knownCards.length
                  } as React.CSSProperties}
                  title={CARD_NAMES[card.variant]}
                >
                  <img
                    src={CARDS[card.variant]}
                    alt={CARD_NAMES[card.variant]}
                    className="discarded-card-image"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).classList.add('loaded');
                    }}
                  />
                  <div className="card-shadow"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-discard-message">
              <div className="empty-icon">🎭</div>
              <p>Nenhuma carta descartada ainda</p>
            </div>
          )}
        </div>
      </div>
     
      <div className="discard-decorations">
        <div className="decoration discard-star">✨</div>
        <div className="decoration discard-note">♫</div>
      </div>
    </div>
  );
};

export default DiscardedCards;