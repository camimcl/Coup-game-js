import React, { useState, useEffect } from 'react';
import { post } from '../../utils/api';
import { useSocketContext } from '../../contexts/SocketProvider';
import { useGameState } from '../../contexts/GameStateProvider';
import { useMatch } from '../../contexts/MatchProvider';

/**
 * Props for PreConnect
 */
interface PreConnectProps {
  playerName: string;
  setPlayerName: (v: string) => void;
  matchId: string;
  setMatchId: (v: string) => void;
  handleCreate: () => Promise<void>;
  handleJoin: () => void;
  error: string | null;
}

/**
 * Controls rendering before connection
 */
function PreConnect({
  playerName,
  setPlayerName,
  matchId,
  setMatchId,
  handleCreate,
  handleJoin,
  error,
}: PreConnectProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Join or Create a Match</h2>
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          value={playerName}
          placeholder="Your name"
          onChange={(e) => setPlayerName(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Create
          </button>
          <span className="text-gray-500">— or —</span>
          <input
            type="text"
            value={matchId}
            placeholder="Match ID"
            onChange={(e) => setMatchId(e.target.value)}
            className="border rounded p-2 w-24"
          />
          <button
            onClick={handleJoin}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Join
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

/**
 * Props for PostConnect
 */
interface PostConnectProps {
  connectedNs: string;
  count: number;
  names: string[];
  isHost: boolean;
  handleStart: () => Promise<void>;
  error: string | null;
}

/**
 * Displays status after connection
 */
function PostConnect({
  connectedNs,
  count,
  names,
  isHost,
  handleStart,
  error,
}: PostConnectProps) {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <p>
        Connected to: <strong>{connectedNs}</strong>
      </p>
      <p>
        Players: <strong>{count}</strong>
      </p>
      <ul className="list-disc pl-5">
        {names.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      {isHost && count >= 4 ? (
        <button
          onClick={handleStart}
          className="mt-3 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
        >
          Start Game
        </button>
      ) : (
        <p className="mt-3 text-gray-600">Waiting for host...</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function MatchSetup() {
  const [matchId, setMatchId] = useState('');
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('playerName') || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [count, setCount] = useState(0);
  const [names, setNames] = useState<string[]>([]);

  const { socket, connectedNs, connectToNamespace } =
    useSocketContext();
  const { gameState } = useGameState();
  const { match } = useMatch();

  /** Create a new match via API */
  async function createMatch() {
    const res = await post<{}, { matchId: string }>(
      '/api/create-match',
      {}
    );
    return res.matchId;
  }

  /** Handle "Create Match" click */
  const handleCreate = async () => {
    setError(null);
    if (!playerName.trim()) {
      setError('Enter your name.');
      return;
    }
    try {
      const id = await createMatch();
      setMatchId(id);
      connectToNamespace(id, playerName);
      setIsHost(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  /** Handle "Join Match" click */
  const handleJoin = () => {
    setError(null);
    const id = matchId.trim();
    if (!id || !playerName.trim()) {
      setError('Provide name and ID.');
      return;
    }
    connectToNamespace(id, playerName);
    setIsHost(false);
  };

  /** Handle "Start Game" click */
  const handleStart = async () => {
    setError(null);
    await post<{}, void>('/api/start-match/' + matchId, {});
  };

  // Persist player name
  useEffect(() => {
    localStorage.setItem('playerName', playerName);
  }, [playerName]);

  // Update player list
  useEffect(() => {
    if (!socket || !gameState) return;
    setCount(gameState.players.length);
    setNames(gameState.players.map((p) => p.name));
  }, [socket, gameState]);

  // Determine host status
  useEffect(() => {
    setIsHost(match?.hostUUID === socket?.id);
  }, [match, socket]);

  return (
    <div className="max-w-md mx-auto p-4">
      {connectedNs ? (
        <PostConnect
          connectedNs={connectedNs}
          count={count}
          names={names}
          isHost={isHost}
          handleStart={handleStart}
          error={error}
        />
      ) : (
        <PreConnect
          playerName={playerName}
          setPlayerName={setPlayerName}
          matchId={matchId}
          setMatchId={setMatchId}
          handleCreate={handleCreate}
          handleJoin={handleJoin}
          error={error}
        />
      )}
    </div>
  );
}
