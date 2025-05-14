/**
 * MatchSetup Component
 *
 * Allows users to create a new match or join an existing match by ID.
 * Utilizes the useSocket hook to connect to the appropriate Socket.IO namespace,
 * displays the current number of connected players, and shows a Start Game button for the host.
 */
import React, { useState, useEffect } from 'react';
import './MatchSetup.scss';
import { post } from '../../utils/api';
import { useSocketContext } from '../../contexts/SocketProvider.tsx';

export default function MatchSetup() {
  const [matchId, setMatchId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  const { socket, connectedNs, connectToNamespace } = useSocketContext();

  /**
   * Calls backend to create a new match and returns its ID
   */
  async function createMatch(): Promise<string> {
    const { matchId } = await post<{}, { matchId: string }>(
      '/api/create-match',
      {}
    );
    return matchId;
  }

  /**
   * Handler for "Create Match" button - sets host flag
   */
  const handleCreate = async () => {
    setError(null);
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    try {
      const id = await createMatch();
      setMatchId(id);
      connectToNamespace(id)
      setIsHost(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  /**
   * Handler for "Join Match" button - resets host flag
   */
  const handleJoin = () => {
    setError(null);
    const trimmed = matchId.trim();
    if (!trimmed) {
      setError('Please enter a valid match ID.');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    connectToNamespace(trimmed);
    setIsHost(false);
  };

  /**
   * Handler for "Start Game" button - emits event to server
   */
  const handleStartGame = async () => {
    setError(null);

    await post<{}, void>(
      '/api/start-match/' + matchId,
      {}
    );

  };

  // Listen for player count updates
  useEffect(() => {
    if (!socket) return;

    const handleCount = (count: number) => {
      setPlayerCount(count);
    };

    const handlePlayerNames = (names: string[]) => {
      setPlayerNames(names);
    };

    socket.on('PLAYER_COUNT_UPDATE', handleCount);
    socket.on('PLAYER_NAMES_UPDATE', handlePlayerNames);
    return () => {
      socket.off('PLAYER_COUNT_UPDATE', handleCount);
      socket.off('PLAYER_NAMES_UPDATE', handlePlayerNames);
    };
  }, [socket, connectedNs]);

  return (
    <div className="match-setup-container">
      {/* Pre-connection controls */}
      {!connectedNs && (
        <>
          <h2>Join or Create a Match</h2>
          <div className="controls">
            <input
              type="text"
              value={playerName}
              placeholder="Enter your name"
              onChange={e => setPlayerName(e.target.value)}
            />
            <button onClick={handleCreate}>Create Match</button>
            <span className="or-label">— or —</span>
            <input
              type="text"
              value={matchId}
              placeholder="Enter match ID"
              onChange={e => setMatchId(e.target.value)}
            />
            <button onClick={handleJoin}>Join Match</button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      )}

      {/* Post-connection status */}
      {connectedNs && (
        <div className="status-panel">
          <div className="connected-info">
            Connected to match: <strong>{connectedNs}</strong>
          </div>
          <div className="player-count">
            Players connected: <strong>{playerCount}</strong>
          </div>
          <div className="player-names">
            <h3>Players:</h3>
            <ul>
              {playerNames.map((name, idx) => (
                <li key={idx}>{name}</li>
              ))}
            </ul>
          </div>

          {isHost ? (
            <button className="start-game-button" onClick={handleStartGame}>
              Start Game
            </button>
          ) : (
            <div className="waiting-info">
              Waiting for the host to start the game...
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}
