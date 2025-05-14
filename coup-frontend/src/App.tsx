import React, { useEffect, useState } from 'react';
import MatchSetup from './components/MatchSetup/MatchSetup';
import PlayersInfo from './components/PlayersInfo/PlayersInfo';
import { useMatch } from './contexts/MatchProvider';

export default function App() {
  const {match} = useMatch();

  return (
    <div className="app-container">
      {
        match?.inProgress ? <PlayersInfo /> : <MatchSetup />
      }

    </div>
  );
}
