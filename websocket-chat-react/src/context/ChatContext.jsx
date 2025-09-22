// src/context/ChatContext.jsx
import React, { createContext, useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebsocket";
import "../styles/global.css";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState("");
  const currentUserRef = useRef(currentUser); // keep latest currentUser in ref

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Disconnected");

  const { stompClient, connected, connectWS, disconnectWS, sendMessageWS } = useWebSocket({
    onConnect: () => setStatus("Connected"),
    onDisconnect: () => setStatus("Disconnected"),

    // Handle incoming messages
    onMessage: (msg) => {
      setMessages((prev) => {
        // Check duplicate by id or fallback to sender+content+timestamp
        const isDuplicate = prev.some(
          (m) =>
            (m.id && msg.id && m.id === msg.id) ||
            (!msg.id &&
              m.sender === msg.sender &&
              m.content === msg.content &&
              m.timestamp === msg.timestamp)
        );
        if (isDuplicate) return prev;

        // For public message: show to all
        if (!msg.receiver) return [...prev, { ...msg, isPrivate: false }];

        const isSender = msg.sender === currentUserRef.current;
        const isReceiver = msg.receiver === currentUserRef.current;

        // Show private messages only to sender or receiver
        if (!isSender && !isReceiver) return prev;

        // Format message display content
        const formattedMsg = {
          ...msg,
          isPrivate: true,
          displayContent: isSender
            ? `${msg.sender} (private) to ${msg.receiver}: ${msg.content}`
            : `From ${msg.sender} (private): ${msg.content}`,
        };

        return [...prev, formattedMsg];
      });
    },

    onUserList: (userList) => setUsers(userList),
    onStatus: (statusMsg) => setStatus(statusMsg),
  });

  const connect = useCallback(
    (username) => {
      if (!username) return;
      setCurrentUser(username);
      connectWS(username);
    },
    [connectWS]
  );

  const disconnect = useCallback(() => {
    disconnectWS();
    setCurrentUser("");
    setUsers([]);
    setMessages([]);
    setStatus("Disconnected");
  }, [disconnectWS]);

  const sendMessage = useCallback(
    (content, receiver = null) => {
      if (!content || !connected) return;
      const payload = {
        sender: currentUser,
        content,
        receiver: receiver || null,
      };
      sendMessageWS(payload);
    },
    [currentUser, connected, sendMessageWS]
  );

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        connected,
        users,
        messages,
        status,
        stompClient,
        connect,
        disconnect,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
