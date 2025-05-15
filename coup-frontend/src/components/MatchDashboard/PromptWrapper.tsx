// src/components/MatchDashboard/PromptWrapper.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../../contexts/SocketProvider';
import { PROMPT, PROMPT_RESPONSE } from '../../events';

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

  // Listen for new prompts
  useEffect(() => {
    if (!socket) return;
    const onPrompt = (data: PromptData) => {
      setPrompt(data);
      setSelected([]);
    };
    socket.on(PROMPT, onPrompt);
    return () => { socket.off(PROMPT, onPrompt); };
  }, [socket]);

  // Auto-clear if expiration is defined
  useEffect(() => {
    if (!prompt || prompt.expiration == null) return;
    const timer = setTimeout(() => setPrompt(null), prompt.expiration);
    return () => { clearTimeout(timer); };
  }, [prompt]);

  const sendSingle = useCallback((v: string|number|boolean) => {
    socket?.emit(PROMPT_RESPONSE, v);
    setPrompt(null);
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

  return (
    <div
      id="prompt-wrapper"
      className="
        inset-0 flex items-center justify-center
        bg-opacity-50 p-4
      "
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <p className="mb-4 text-gray-800 font-medium">
          {prompt.message}
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {prompt.options.map((opt) =>
            isMulti ? (
              <label
                key={opt.value.toString()}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value.toString())}
                  onChange={() => toggleSelect(opt.value.toString())}
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ) : (
              <button
                key={opt.value.toString()}
                className="
                  w-full text-left px-4 py-2
                  bg-blue-500 text-white rounded
                  hover:bg-blue-600
                "
                onClick={() => sendSingle(opt.value)}
              >
                {opt.label}
              </button>
            )
          )}
        </div>
        {isMulti && (
          <button
            className="
              w-full px-4 py-2
              bg-green-500 text-white rounded
              hover:bg-green-600 disabled:opacity-50
            "
            onClick={confirmMulti}
            disabled={selected.length === 0}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

export default PromptWrapper;
