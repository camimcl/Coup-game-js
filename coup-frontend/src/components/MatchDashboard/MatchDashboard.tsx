import React from 'react';

import Players from './Players';
import DiscardedCards from './DiscardedCards';
import PromptWrapper from './PromptWrapper';
import Logs from './Logs';
import PlayerCards from './PlayerCards';

const MatchDashboard: React.FC = () => (
  <div className="match-dashboard">
    <Players />
    <DiscardedCards />
    <PromptWrapper />
    <Logs />
    <PlayerCards />
  </div>
);

export default MatchDashboard;
