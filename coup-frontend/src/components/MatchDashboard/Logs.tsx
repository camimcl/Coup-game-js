import React, { useEffect, useState } from 'react';
import { useSocketContext } from '../../contexts/SocketProvider';
import { LOG } from '../../events';

const Logs: React.FC = () => {
  const { socket } = useSocketContext();

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on(LOG, (message: string) => {
      setLogs([message, ...logs])
    })

    return () => {
      socket.off(LOG)
    }
  }, [socket, logs])

  return (
    <div id="logs">
      <h3 className='mb-2'>Logs</h3>
      {
        logs.map((log) => (<span className='block mb-1'>{log}</span>))
      }
    </div>
  );
};

export default Logs;
