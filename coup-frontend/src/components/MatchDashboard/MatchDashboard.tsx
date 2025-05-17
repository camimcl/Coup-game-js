import React from 'react';
import Players from './Players';
import Deck from './Deck';
import DiscardedCards from './DiscardedCards';
import PromptWrapper from './PromptWrapper';
import Logs from './Logs';
import PlayerCards from './PlayerCards';
import './MatchDashboard.css';

const MatchDashboard: React.FC = () => (
  <div className="match-dashboard coup-layout">
    <div className="stage-backdrop">
      <div className="backdrop-curtain curtain-left"></div>
      <div className="backdrop-curtain curtain-right"></div>
      <div className="spotlight spotlight-1"></div>
      <div className="spotlight spotlight-2"></div>
      <div className="spotlight spotlight-3"></div>
    </div>
    
    <Players />
    <Deck />
    <DiscardedCards />
    <PromptWrapper />
    <Logs />
    <PlayerCards />
    
    <div className="floating-decorations">
      <div className="floating-die"></div>
      <div className="floating-coin"></div>
      <div className="floating-card"></div>
    </div>
  </div>
);

export default MatchDashboard;