import React from 'react';

interface LogsProps {
  /** Game event log entries */
}

 /**
  * Scrollable log panel showing past game events.
  */
const Logs: React.FC<LogsProps> = () => {
  return (
    <div id="logs">
      {/* TODO: map over log entries */}
    </div>
  );
};

export default Logs;
