import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocketContext } from './SocketProvider.tsx';
import { MATCH_STATE_UPDATE } from '../events';
import type { PlayerInfo } from './GameStateProvider.tsx';
import { get } from '../utils/api.ts';

export interface Match {
  players: PlayerInfo[];
  hostUUID: string;
  inProgress: boolean;
}

interface MatchContextValue {
  match: Match | null;
  setMatch: React.Dispatch<React.SetStateAction<Match | null>>
}

const MatchContext = createContext<MatchContextValue | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocketContext();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (state: Match) => {
      setMatch(state);
    };

    socket.on(MATCH_STATE_UPDATE, handler);

    return () => {
      socket.off(MATCH_STATE_UPDATE, handler);
    };
  }, [socket]);

  useEffect(() => {
    const match = location.pathname.match(/^\/([^\/]+)$/);
    if (match) {
      get<Match>(
        '/api/get-match' + match[0],
      ).then(setMatch);
    }
  }, []);


  return (
    <MatchContext.Provider value={{ match: match, setMatch: setMatch }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch(): MatchContextValue {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return { match: context.match, setMatch: context.setMatch };
}
