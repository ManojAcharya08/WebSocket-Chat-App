import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageItem from './MessageItem';
import "../styles/global.css";

const MessageList = () => {
  const { messages, currentUser } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Filter messages so private messages only show to sender or receiver
  const visibleMessages = messages.filter(msg => {
    if (!msg.receiver) return true; // public message
    const sender = msg.sender?.toLowerCase();
    const receiver = msg.receiver?.toLowerCase();
    const me = currentUser?.toLowerCase();
    return sender === me || receiver === me;
  });

  // Deduplicate messages by unique id (optional safeguard)
  const dedupedMessages = Array.from(
    new Map(visibleMessages.map(msg => [msg.id, msg])).values()
  );

  return (
    <ul className="messages">
      {dedupedMessages.map((msg, index) => (
        <MessageItem 
          key={msg.id || `${msg.sender}-${msg.timestamp || index}`} 
          message={msg} 
          isSender={msg.sender?.toLowerCase() === currentUser?.toLowerCase()}
        />
      ))}
      <div ref={messagesEndRef} />
    </ul>
  );
};

export default MessageList;
