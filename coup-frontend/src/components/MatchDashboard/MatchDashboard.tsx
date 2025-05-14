import React from 'react';
import './MatchDashboard.scss';

import Players from './Players';
import Deck from './Deck';
import DiscardedCards from './DiscardedCards';
import PromptWrapper from './PromptWrapper';
import Logs from './Logs';
import PlayerCards from './PlayerCards';

const MatchDashboard: React.FC = () => (
  <div className="match-dashboard">
    <Players />
    <Deck />
    <DiscardedCards />
    <PromptWrapper />
    <Logs />
    <PlayerCards />
  </div>
);

export default MatchDashboard;
