import React, { useEffect, useState } from 'react';
import { useGameState, type Card } from '../../contexts/GameStateProvider';
import { useSocketContext } from '../../contexts/SocketProvider';
import { PRIVATE_PLAYER_INFO_UPDATE, REQUEST_PRIVATE_PLAYER_INFO } from '../../events';

export interface PrivatePlayerInfo {
  uuid: string;
  name: string;
  cards: Card[];
  coins: number;
}

const PlayerCards: React.FC = () => {
  const { gameState } = useGameState();
  const { socket } = useSocketContext();

  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    if (!socket) return;

    socket.emit(REQUEST_PRIVATE_PLAYER_INFO);

    socket.on(PRIVATE_PLAYER_INFO_UPDATE, (playerInfo: PrivatePlayerInfo) => {
      setCards(playerInfo.cards)
    })

  }, [socket])

  if (!gameState || !socket) return null;

  return (
    <div
      id="player-cards"
      className="flex items-center gap-2 p-2 overflow-x-auto"
    >
      {cards.map((card, i) => {
        // Vite-friendly dynamic import of an asset
        const src = new URL(
          `../../assets/images/${card.variant.toLowerCase()}.png`,
          import.meta.url
        ).href;

        return (
          <img
            key={i}
            src={src}
            alt={card.variant}
            style={{ maxWidth: "120px" }}
            className="object-contain flex-shrink-0"
          />
        );
      })}
    </div>
  );
};

export default PlayerCards;
