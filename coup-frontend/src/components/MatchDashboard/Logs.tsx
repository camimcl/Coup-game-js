import React, { useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../../contexts/SocketProvider';
import './Logs.css';

interface LogEntry {
  message: string;
  timestamp: Date;
  type: 'normal' | 'action' | 'system' | 'warning';
}

const Logs: React.FC = () => {
  const { socket } = useSocketContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  

  //ai tem que fazer a dinâmica dos logs ne, tem uns aí de exemplo
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      { 
        message: 'Bem-vindo ao jogo de Coup!', 
        timestamp: new Date(Date.now() - 300000), 
        type: 'system' 
      },
      // { 
      //   message: 'Jogador Pedro usou Duque para coletar impostos (+3 moedas)', 
      //   timestamp: new Date(Date.now() - 240000), 
      //   type: 'action' 
      // },
      // { 
      //   message: 'Jogador João tentou assassinar Maria (-3 moedas)', 
      //   timestamp: new Date(Date.now() - 180000), 
      //   type: 'action' 
      // },
      // { 
      //   message: 'Jogador Maria bloqueou com Condessa', 
      //   timestamp: new Date(Date.now() - 170000), 
      //   type: 'action' 
      // },
      // { 
      //   message: 'Jogador João desafiou Maria', 
      //   timestamp: new Date(Date.now() - 160000), 
      //   type: 'action' 
      // },
      // { 
      //   message: 'Desafio falhou! João perdeu uma carta', 
      //   timestamp: new Date(Date.now() - 150000), 
      //   type: 'warning' 
      // },
      // { 
      //   message: 'Jogador Ana coletou ajuda externa (+2 moedas)', 
      //   timestamp: new Date(Date.now() - 120000), 
      //   type: 'action' 
      // },
      // { 
      //   message: 'É a vez de Pedro jogar', 
      //   timestamp: new Date(Date.now() - 60000), 
      //   type: 'system' 
      // },
      // { 
      //   message: 'Pedro passou a vez', 
      //   timestamp: new Date(Date.now() - 30000), 
      //   type: 'normal' 
      // },
      // { 
      //   message: 'É a sua vez de jogar!', 
      //   timestamp: new Date(), 
      //   type: 'system' 
      // }
    ];
    
    setLogs(initialLogs);
  }, []);
  
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getLogIcon = (type: string): string => {
    switch (type) {
      case 'action': return '🎭';
      case 'system': return '🔔';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };
  
  return (
    <div id="logs" className="logs-container">
      <div className="logs-header">
        <div className="header-ornament">◆</div>
        <h3 className="logs-title">Histórico do Jogo</h3>
        <div className="header-ornament">◆</div>
      </div>
      
      <div className="logs-scroll-area">
        {logs.length === 0 ? (
          <div className="empty-logs">
            <div className="empty-icon">📜</div>
            <p>Ainda não há eventos no jogo</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index}
              className={`log-entry log-type-${log.type}`}
              style={{ '--entry-index': index } as React.CSSProperties}
            >
              <div className="log-timestamp">{formatTime(log.timestamp)}</div>
              <div className="log-icon">{getLogIcon(log.type)}</div>
              <div className="log-message">{log.message}</div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
      
      <div className="logs-decorations">
        <div className="ink-splat splat-1"></div>
        <div className="ink-splat splat-2"></div>
        <div className="paper-fold"></div>
      </div>
    </div>
  );
};

export default Logs;