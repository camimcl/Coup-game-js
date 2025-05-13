import React, { useEffect, useState } from 'react';
import MatchSetup from './components/MatchSetup/MatchSetup';
import PlayersInfo from './components/PlayersInfo/PlayersInfo';
import { GAME_START } from './events';
import { useSocketContext } from './contexts/SocketProvider';

export default function App() {
  const [gameInProgress, setGameInProgress] = useState(false);

  const { socket } = useSocketContext();

  useEffect(() => {
    console.log(`Socket is`)
    console.log(socket)
    socket?.on(GAME_START, () => { setGameInProgress(true); console.log("Starting game") });

    console.log(`Listening to GAME_START`)

    return () => {
      socket?.off(GAME_START);
    }
  }, [socket]);

  return (
    <div className="app-container">
      {
        gameInProgress ? <PlayersInfo /> : <MatchSetup />
      }

    </div>
  );
}
