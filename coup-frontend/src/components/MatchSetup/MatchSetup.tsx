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
import { useGameState } from '../../contexts/GameStateProvider.tsx';
import { useMatch } from '../../contexts/MatchProvider.tsx';

export default function MatchSetup() {
  const [matchId, setMatchId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(localStorage.getItem("playerName") || "");
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  const { socket, connectedNs, connectToNamespace } = useSocketContext();
  const { gameState } = useGameState();
  const { match } = useMatch();

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
      connectToNamespace(id, playerName)
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
    connectToNamespace(trimmed, playerName);
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

  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName])

  // Listen for player count updates
  useEffect(() => {
    if (!socket || !gameState) return;

    setPlayerCount(gameState.players.length);

    setPlayerNames(gameState.players.map((p) => p.name));
  }, [socket, gameState]);

  useEffect(() => {
    setIsHost(match?.hostUUID === socket?.id)
  }, [match, socket])

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

          {isHost && playerCount >= 4 ? (
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
