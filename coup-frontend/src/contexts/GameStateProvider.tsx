import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocketContext } from './SocketProvider.tsx';
import { GAME_STATE_UPDATE } from '../events';
import type { CardVariant } from '../constants/constants.ts';

// Define the shape of a player (mirror your PlayerInfo interface)
export interface PlayerInfo {
  uuid: string;
  name: string;
  cardsCount: number;
  coins: number;
}

export interface Card {
  uuid: string;
  variant: CardVariant
}

// Define the overall game state shape
export interface GameState {
  currentPlayer: string;
  players: PlayerInfo[];
  deckSize: number
  knownCards: Card[]
  // add other game state fields here as needed
}

interface GameStateContextValue {
  /** The latest game state payload from the server */
  gameState: GameState | null;
}

const GameStateContext = createContext<GameStateContextValue | undefined>(undefined);

/**
 * Provides current GameState to descendants by subscribing to the
 * GAME_STATE_UPDATE socket event under the active namespace.
 */
export function GameStateProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocketContext();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (state: GameState) => {
      // console.log("Game state updated: ")
      // console.log(state)
      setGameState(state);
    };

    // console.log("Listening to game updates")
    socket.on(GAME_STATE_UPDATE, handler);

    return () => {
      socket.off(GAME_STATE_UPDATE, handler);
    };
  }, [socket]);

  return (
    <GameStateContext.Provider value={{ gameState }}>
      {children}
    </GameStateContext.Provider>
  );
}

/**
 * Hook for components to read the latest game state.
 * Throws an error if used outside of GameStateProvider.
 */
export function useGameState(): {gameState: GameState | null} {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return {gameState: context.gameState};
}
