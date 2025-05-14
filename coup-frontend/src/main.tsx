import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/_base.scss'
import App from './App.tsx'
import { SocketProvider } from './contexts/SocketProvider.tsx'
import { GameStateProvider } from './contexts/GameStateProvider.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import { MatchProvider } from './contexts/MatchProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <MatchProvider>
          <GameStateProvider>
            <App />
          </GameStateProvider>
        </MatchProvider>
      </SocketProvider>
    </BrowserRouter>
  </StrictMode >,
)
