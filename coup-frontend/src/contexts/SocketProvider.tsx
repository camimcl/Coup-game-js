import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Shape of the context value for socket management
 */
interface SocketContextValue {
  /** Latest Socket.IO instance */
  socket: Socket | null;
  /** Currently connected namespace */
  connectedNs: string;
  /** Function to switch namespaces */
  connectToNamespace: (ns: string) => void;
}

// Create the context
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

/**
 * Provider that encapsulates all socket logic internally.
 * Components can subscribe via `useSocketContext()`.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const [namespace, setNamespace] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Effect: reconnect whenever namespace changes
  useEffect(() => {
    // Tear down previous socket
    socketRef.current?.disconnect();

    // Build connection URL
    const url =
      namespace.trim() === ''
        ? import.meta.env.VITE_API_URL
        : `${import.meta.env.VITE_API_URL}/${namespace}`;

    // Initialize new socket
    const sock = io(url);
    socketRef.current = sock;
    setSocket(sock);

    // Cleanup on namespace change or unmount
    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [namespace]);

  // Expose a stable function to change namespaces
  const connectToNamespace = useCallback((ns: string) => {
    setNamespace(ns);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectedNs: namespace, connectToNamespace }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook for consuming the socket context.
 */
export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
