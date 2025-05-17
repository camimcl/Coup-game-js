import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState, type Card } from '../../contexts/GameStateProvider';
import { useSocketContext } from '../../contexts/SocketProvider';
import { PRIVATE_PLAYER_INFO_UPDATE, REQUEST_PRIVATE_PLAYER_INFO, CARD_DISCARDED } from '../../events';
import './PlayerCards.css';

export interface PrivatePlayerInfo {
  uuid: string;
  name: string;
  cards: Card[];
  coins: number;
}

const PlayerCards: React.FC = () => {
  const { gameState } = useGameState();
  const { socket } = useSocketContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [discardedCardId, setDiscardedCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const previousCardsRef = useRef<Card[]>([]);
  const processingDiscardRef = useRef<boolean>(false);
  
  const processCardDiscard = useCallback((cardId: string) => {
    if (processingDiscardRef.current || discardedCardId === cardId) return;
    
    processingDiscardRef.current = true;
    setDiscardedCardId(cardId);
    setIsDiscarding(true);
    
    setTimeout(() => {
      setCards(currentCards => 
        currentCards.filter(card => card.uuid !== cardId)
      );
      setDiscardedCardId(null);
      setIsDiscarding(false);
      processingDiscardRef.current = false;
    }, 1500);
  }, [discardedCardId]);
  
  const handlePlayerInfoUpdate = useCallback((playerInfo: PrivatePlayerInfo) => {
    if (processingDiscardRef.current) return;
    
    const currentCards = [...previousCardsRef.current];
    previousCardsRef.current = [...(playerInfo.cards || [])];
    
    if (currentCards.length > playerInfo.cards.length && currentCards.length > 0) {
      const removedCard = currentCards.find(
        oldCard => !playerInfo.cards.some(newCard => newCard.uuid === oldCard.uuid)
      );
      
      if (removedCard && !processingDiscardRef.current) {
        processCardDiscard(removedCard.uuid);
      } else {
        setCards(playerInfo.cards);
      }
    } else {
      setCards(playerInfo.cards);
    }
    
    setIsLoading(false);
  }, [processCardDiscard]);

  const handleCardDiscarded = useCallback((data: {cardId: string}) => {
    if (data && data.cardId && !processingDiscardRef.current) {
      processCardDiscard(data.cardId);
    }
  }, [processCardDiscard]);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit(REQUEST_PRIVATE_PLAYER_INFO);
    
    socket.on(PRIVATE_PLAYER_INFO_UPDATE, handlePlayerInfoUpdate);
    socket.on(CARD_DISCARDED, handleCardDiscarded);
    
    const refreshInterval = setInterval(() => {
      if (!processingDiscardRef.current) {
        socket.emit(REQUEST_PRIVATE_PLAYER_INFO);
      }
    }, 5000);
    
    return () => {
      socket.off(PRIVATE_PLAYER_INFO_UPDATE, handlePlayerInfoUpdate);
      socket.off(CARD_DISCARDED, handleCardDiscarded);
      clearInterval(refreshInterval);
    };
  }, [socket, handlePlayerInfoUpdate, handleCardDiscarded]);

  useEffect(() => {
    if (socket && gameState && !processingDiscardRef.current) {
      socket.emit(REQUEST_PRIVATE_PLAYER_INFO);
    }
  }, [socket, gameState]);

  if (!gameState || !socket) return null;

  return (
    <div id="player-cards" className="player-cards-container">
      <div className="cards-title coup-text">
        <span className="title-highlight">🎭</span>
        Suas Cartas
        <span className="title-highlight">🎭</span>
      </div>
     
      {isLoading ? (
        <div className="loading-container">
          <div className="coup-loader">
            <div className="loader-card"></div>
            <div className="loader-card"></div>
            <div className="loader-card"></div>
          </div>
          <p className="loading-text">Preparando suas cartas...</p>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card, index) => {
            const src = new URL(
              `../../assets/images/${card.variant.toLowerCase()}.png`,
              import.meta.url
            ).href;
            const isBeingDiscarded = card.uuid === discardedCardId;
            
            return (
              <div 
                key={card.uuid || index} 
                className={`card-wrapper card-${index + 1} ${isBeingDiscarded ? 'discarding' : ''}`}
                style={{ '--card-index': index } as React.CSSProperties}
              >
                <div className="card-inner">
                  <img
                    src={src}
                    alt={card.variant}
                    className="card-image"
                    onError={(e) => {
                      // fallback
                      (e.target as HTMLImageElement).src = '/api/placeholder/120/168';
                    }}
                  />
                  <div className="card-gloss"></div>
                  <div className="card-border"></div>
                  {isBeingDiscarded && <div className="discard-overlay"></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isDiscarding && (
        <div className="discard-effect">
          <div className="discard-splash"></div>
          <div className="discard-text">Carta Descartada!</div>
        </div>
      )}
     
      <div className="cards-decoration">
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
      </div>
    </div>
  );
};

export default PlayerCards;