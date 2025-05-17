import React, { useState, useEffect } from 'react';
import { post } from '../../utils/api';
import { useSocketContext } from '../../contexts/SocketProvider';
import { useGameState } from '../../contexts/GameStateProvider';
import { useMatch } from '../../contexts/MatchProvider';
import './MatchSetup.css';

interface PreConnectProps {
  playerName: string;
  setPlayerName: (v: string) => void;
  matchId: string;
  setMatchId: (v: string) => void;
  handleCreate: () => Promise<void>;
  handleJoin: () => void;
  error: string | null;
}

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
    <div className="pre-connect-container">
      <div className="title-card">
        <h1 className="game-title">COUP!</h1>
        <div className="subtitle">joguinhos da galera</div>
        <div className="vintage-ornament">
          <span className="ornament-left">◆</span>
          <span className="ornament-center">❋</span>
          <span className="ornament-right">◆</span>
        </div>
      </div>

      <div className="player-setup-card">
        <h2 className="setup-title">
          <span className="title-icon">🎭</span>
            ENTRAR NA SALA
          <span className="title-icon">🎭</span>
        </h2>
        
        <div className="form-container">
          <div className="input-group">
            <label className="input-label">Seu usuário</label>
            <input
              type="text"
              value={playerName}
              placeholder="Enter your name, performer!"
              onChange={(e) => setPlayerName(e.target.value)}
              className="coup-input player-name-input"
              maxLength={20}
            />
          </div>

          <div className="actions-container">
            <button
              onClick={handleCreate}
              className="coup-button create-button"
              disabled={!playerName.trim()}
            >
              <span className="button-icon">⭐</span>
              <span className="button-text">CRIAR SALA</span>
              <div className="button-sparkle"></div>
            </button>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">OU</span>
              <div className="divider-line"></div>
            </div>

            <div className="join-container">
              <div className="input-group">
                <label className="input-label">Código da sala</label>
                <input
                  type="text"
                  value={matchId}
                  placeholder="Insira o código"
                  onChange={(e) => setMatchId(e.target.value)}
                  className="coup-input match-id-input"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleJoin}
                className="coup-button join-button"
                disabled={!playerName.trim() || !matchId.trim()}
              >
                <span className="button-icon">🎪</span>
                <span className="button-text">ENTRAR</span>
                <div className="button-sparkle"></div>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span className="error-text">{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-decorations">
        <div className="decoration-card card-1">🃏</div>
        <div className="decoration-card card-2">🃏</div>
        <div className="decoration-coin coin-1">🪙</div>
        <div className="decoration-coin coin-2">🪙</div>
      </div>
    </div>
  );
}


interface PostConnectProps {
  connectedNs: string;
  count: number;
  names: string[];
  isHost: boolean;
  handleStart: () => Promise<void>;
  error: string | null;
}

function PostConnect({
  connectedNs,
  count,
  names,
  isHost,
  handleStart,
  error,
}: PostConnectProps) {
  return (
    <div className="post-connect-container">
      <div className="waiting-room-card">
        <div className="room-header">
          <h2 className="room-title">
            <span className="title-decoration">🎪</span>
              SALA DE DESCANSO
            <span className="title-decoration">🎪</span>
          </h2>
          <div className="show-info">
            <div className="info-item">
              <span className="info-label">Código da sala:</span>
              <span className="info-value show-id">{connectedNs}</span>
            </div>
          </div>
        </div>

        <div className="players-section">
          <div className="players-header">
            <h3 className="players-title">
              MEMBROS DA PARTIDA
              <span className="player-count"> ({count}/6)</span>
            </h3>
          </div>
          
          <div className="players-grid">
            {names.map((name, index) => (
              <div 
                key={index} 
                className={`player-chip player-${index + 1}`}
                style={{ '--player-index': index } as React.CSSProperties}
              >
                <div className="player-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="player-name">{name}</span>
                <div className="player-status-dot"></div>
              </div>
            ))}
            
            {Array.from({ length: 6 - count }).map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="player-chip empty-slot"
              >
                <div className="empty-avatar">?</div>
                <span className="empty-text">Vazio...</span>
              </div>
            ))}
          </div>
        </div>

        <div className="action-section">
          {isHost ? (
            count >= 2 ? (
              <div className="host-controls">
                <button
                  onClick={handleStart}
                  className="coup-button start-button"
                >
                  {/* <span className="button-icon">🚀</span> */}
                  <span className="button-text">COMEÇAR PARTIDA!</span>
                  <div className="button-confetti"></div>
                </button>
                <p className="min-players-note">
                  {count < 4 && `${4 - count} jogadores a mais recomendado`}
                </p>
              </div>
            ) : (
              <div className="waiting-message">
                <div className="waiting-icon">⏳</div>
                <p>Esperando por pelo menos 2 jogadores...</p>
              </div>
            )
          ) : (
            <div className="guest-waiting">
              <div className="waiting-animation">
                <div className="waiting-dot"></div>
                <div className="waiting-dot"></div>
                <div className="waiting-dot"></div>
              </div>
              <p className="waiting-text">Aguardando host iniciar partida...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>

      <div className="ambient-decorations">
        <div className="floating-musical-note note-1">♪</div>
        <div className="floating-musical-note note-2">♫</div>
        <div className="floating-star star-1">⭐</div>
        <div className="floating-star star-2">✨</div>
      </div>
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

  const { socket, connectedNs, connectToNamespace } = useSocketContext();
  const { gameState } = useGameState();
  const { match } = useMatch();

  async function createMatch() {
    const res = await post<{}, { matchId: string }>('/api/create-match', {});
    return res.matchId;
  }

  const handleCreate = async () => {
    setError(null);
    if (!playerName.trim()) {
      setError('Insira o seu apelido!');
      return;
    }
    try {
      const id = await createMatch();
      setMatchId(id);
      connectToNamespace(id, playerName);
      setIsHost(true);
    } catch (e: any) {
      setError(e.message || 'Falhou ao criar sala');
    }
  };

  const handleJoin = () => {
    setError(null);
    const id = matchId.trim().toUpperCase();
    if (!id || !playerName.trim()) {
      setError('Por favor, insira um nome ou o código da sala.');
      return;
    }
    connectToNamespace(id, playerName);
    setIsHost(false);
  };

  const handleStart = async () => {
    setError(null);
    try {
      await post<{}, void>('/api/start-match/' + matchId, {});
    } catch (e: any) {
      setError(e.message || 'Falha ao iniciar partida');
    }
  };

  useEffect(() => {
    localStorage.setItem('playerName', playerName);
  }, [playerName]);

  useEffect(() => {
    if (!socket || !gameState) return;
    setCount(gameState.players.length);
    setNames(gameState.players.map((p) => p.name));
  }, [socket, gameState]);

  useEffect(() => {
    setIsHost(match?.hostUUID === socket?.id);
  }, [match, socket]);

  return (
    <div className="match-setup-container">
      <div className="scene-background">
        <div className="spotlight spotlight-main"></div>
        <div className="curtain curtain-left"></div>
        <div className="curtain curtain-right"></div>
        <div className="stage-lights">
          <div className="stage-light light-1"></div>
          <div className="stage-light light-2"></div>
          <div className="stage-light light-3"></div>
        </div>
      </div>


      <div className="setup-content">
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
    </div>
  );
}