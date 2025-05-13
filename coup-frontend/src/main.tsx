import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/_base.scss'
import App from './App.tsx'
import { SocketProvider } from './contexts/SocketProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>,
)
