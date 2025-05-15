import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

/**
 * Shape of the context value for socket management, including initial handshake data.
 */
interface SocketContextValue {
  /** Latest Socket.IO instance */
  socket: Socket | null;
  /** Currently connected namespace */
  connectedNs: string;
  /** Username sent on connect */
  username: string | null;
  /** Switches the connection to a new namespace and username */
  connectToNamespace: (ns: string, username: string) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [namespace, setNamespace] = useState<string>('');
  const [username, setUsername] = useState<string>(localStorage.getItem("playerName") || "");
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const match = location.pathname.match(/^\/([^\/]+)$/);
    if (match) {
      setUsername(localStorage.getItem("playerName") || '');
      setNamespace(match[1]);
    }
  }, [location.pathname]);

  useEffect(() => {
    socketRef.current?.disconnect();
    console.log(`Namespace or username changed, disconnecting ${namespace} ${username}`)


    const url = namespace.trim() === ''
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/${namespace}`;

    const options = username
      ? { auth: { username }, namespace }
      : { namespace };

    const sock = io(url, options);
    socketRef.current = sock;
    setSocket(sock);

    return () => {
      console.log(`(return) Namespace or username changed, disconnecting ${namespace} ${username}`)
      sock.disconnect();
      setSocket(null);
    };
  }, [namespace, username]);

  const connectToNamespace = useCallback((ns: string, user: string) => {
    setUsername(user);
    setNamespace(ns);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectedNs: namespace, username, connectToNamespace }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
