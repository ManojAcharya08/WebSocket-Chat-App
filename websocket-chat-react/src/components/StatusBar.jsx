import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import "../styles/global.css"

const StatusBar = () => {
  const { stompClient } = useContext(ChatContext);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (!stompClient) return;
    const interval = setInterval(() => {
      setStatus(stompClient.connected ? 'Connected' : 'Disconnected');
    }, 500);
    return () => clearInterval(interval);
  }, [stompClient]);

  return (
    <div className={`status-bar ${status.toLowerCase()}`}>{status}</div>
  );
};

export default StatusBar;
