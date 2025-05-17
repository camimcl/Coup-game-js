// src/components/MatchDashboard/PromptWrapper.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../../contexts/SocketProvider';
import { PROMPT, PROMPT_RESPONSE } from '../../events';
import './PromptWrapper.css';

export const PROMPT_OPTION_CHALLENGE_ACCEPT = 'PROMPT_OPTION_CHALLENGE_ACCEPT';
export const PROMPT_OPTION_CHALLENGE_PASS   = 'PROMPT_OPTION_CHALLENGE_PASS';

export type PROMPT_OPTION_VALUE =
  typeof PROMPT_OPTION_CHALLENGE_ACCEPT |
  typeof PROMPT_OPTION_CHALLENGE_PASS;

export interface PromptOption {
  label: string;
  value: string | boolean | number;
}

export type PromptVariant =
  'OWNED_CARDS_CHOICE' |
  'OWNED_CARDS_CHOICE_MULTIPLE' |
  'CARDS_CHOICE';

interface PromptData {
  message: string;
  options: PromptOption[];
  variant?: PromptVariant;
  /** ms until prompt auto-expires; if omitted, never clears */
  expiration?: number;
}

const PromptWrapper: React.FC = () => {
  const { socket } = useSocketContext();
  const [prompt, setPrompt] = useState<PromptData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeOption, setActiveOption] = useState<number>(-1);

  useEffect(() => {
    if (!socket) return;
    
    const onPrompt = (data: PromptData) => {
      setPrompt(data);
      setSelected([]);
      setActiveOption(-1);
      
      // se quiser colocar um alertinha quando for a vez
      // playPromptSound();
    };
    
    socket.on(PROMPT, onPrompt);
    return () => { socket.off(PROMPT, onPrompt); };
  }, [socket]);

  useEffect(() => {
    if (!prompt || prompt.expiration == null) return;
    
    const timer = setTimeout(() => setPrompt(null), prompt.expiration);
    
    const startTime = Date.now();
    const duration = prompt.expiration;
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      const progressElement = document.querySelector('.timer-progress') as HTMLElement;
      if (progressElement) {
        const percent = (remaining / duration) * 100;
        progressElement.style.width = `${percent}%`;
      }
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    return () => { clearTimeout(timer); };
  }, [prompt]);

  const sendSingle = useCallback((v: string|number|boolean, index: number) => {
    setActiveOption(index);
    
    setTimeout(() => {
      socket?.emit(PROMPT_RESPONSE, v);
      setPrompt(null);
    }, 300);
  }, [socket]);

  const toggleSelect = useCallback((v: string) => {
    setSelected((cur) =>
      cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    );
  }, []);

  const confirmMulti = useCallback(() => {
    socket?.emit(PROMPT_RESPONSE, selected);
    setPrompt(null);
  }, [socket, selected]);

  if (!prompt || !socket) return null;
  
  const isMulti = prompt.variant === 'OWNED_CARDS_CHOICE_MULTIPLE';
  
  const getPromptIcon = (message: string) => {
    if (message.includes('desafiar') || message.includes('desafio')) return '⚔️';
    if (message.includes('bloquear')) return '🛡️';
    if (message.includes('assassin')) return '🗡️';
    if (message.includes('duke') || message.includes('duque')) return '👑';
    if (message.includes('captain') || message.includes('capitão')) return '⚓';
    if (message.includes('ambassador') || message.includes('embaixador')) return '📜';
    if (message.includes('condessa')) return '👸';
    if (message.includes('fazer')) return '🎭';
    if (message.includes('escolher') || message.includes('escolha')) return '👆';
    return '❓';
  };

  return (
    <div id="prompt-wrapper" className="prompt-overlay">
      <div className="prompt-card coup-card">
        <div className="prompt-header">
          <span className="prompt-icon">{getPromptIcon(prompt.message)}</span>
          <h3 className="prompt-title">Sua Decisão</h3>
        </div>
        
        <div className="card-decorations">
          <div className="decoration corner-tl"></div>
          <div className="decoration corner-tr"></div>
          <div className="decoration corner-bl"></div>
          <div className="decoration corner-br"></div>
        </div>
        
        <div className="prompt-message">
          {prompt.message}
        </div>
        
        {prompt.expiration && (
          <div className="timer-container">
            <div className="timer-progress"></div>
          </div>
        )}
        
        <div className="prompt-options">
          {prompt.options.map((opt, index) =>
            isMulti ? (
              <label
                key={opt.value.toString()}
                className={`prompt-checkbox-option ${selected.includes(opt.value.toString()) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value.toString())}
                  onChange={() => toggleSelect(opt.value.toString())}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-label">{opt.label}</span>
              </label>
            ) : (
              <button
                key={opt.value.toString()}
                className={`prompt-button ${index === activeOption ? 'active' : ''}`}
                onClick={() => sendSingle(opt.value, index)}
              >
                <span className="button-text">{opt.label}</span>
                <div className="button-shine"></div>
              </button>
            )
          )}
        </div>
        
        {isMulti && (
          <button
            className={`confirm-button ${selected.length === 0 ? 'disabled' : ''}`}
            onClick={confirmMulti}
            disabled={selected.length === 0}
          >
            <span className="button-text">Confirmar</span>
            <div className="button-shine"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default PromptWrapper;