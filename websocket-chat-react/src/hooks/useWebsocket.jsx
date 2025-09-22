// src/hooks/useWebSocket.jsx
import { useRef, useState, useCallback, useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import "../styles/global.css"

/**
 * Custom hook to manage a STOMP WebSocket connection.
 */
export const useWebSocket = ({ onConnect, onDisconnect, onMessage, onUserList, onStatus }) => {
  const stompClientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");

  /**
   * Connect to WebSocket
   */
  const connectWS = useCallback(
    (user) => {
      if (!user) return;
      setUsername(user);
      onStatus?.("Connecting...");

      const socket = new SockJS(`/ws?username=${encodeURIComponent(user)}`);
      const client = over(socket);

      client.connect(
        {},
        () => {
          stompClientRef.current = client;
          setConnected(true);
          onStatus?.("Connected");
          onConnect?.();

          // Register user
          client.send("/app/register", {}, JSON.stringify({ sender: user }));

          // Subscribe to public messages
          client.subscribe("/topic/messages", (msg) => {
            try {
              const message = JSON.parse(msg.body);
              onMessage?.({ ...message, isPrivate: false });
            } catch (err) {
              console.error("Error parsing public message:", err);
            }
          });

          // Subscribe to private messages for this user
          client.subscribe(`/user/queue/messages`, (msg) => {
            try {
              const message = JSON.parse(msg.body);
              onMessage?.({ ...message, isPrivate: true });
            } catch (err) {
              console.error("Error parsing private message:", err);
            }
          });

          // Subscribe to online users
          client.subscribe("/topic/userList", (msg) => {
            try {
              const users = JSON.parse(msg.body);
              onUserList?.(users);
            } catch (err) {
              console.error("Error parsing user list:", err);
            }
          });
        },
        (error) => {
          console.error("WebSocket connection error:", error);
          stompClientRef.current = null;
          setConnected(false);
          onStatus?.("Disconnected");
          onDisconnect?.();
        }
      );
    },
    [onConnect, onDisconnect, onMessage, onUserList, onStatus]
  );

  /**
   * Disconnect from WebSocket
   */
  const disconnectWS = useCallback(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect(() => {
        stompClientRef.current = null;
        setConnected(false);
        onStatus?.("Disconnected");
        onDisconnect?.();
      });
    }
  }, [onDisconnect, onStatus]);

  /**
   * Send a chat message
   */
  const sendMessageWS = useCallback(
    (payload) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.warn("Cannot send message, WebSocket is not connected");
        onStatus?.("Cannot send message, disconnected");
        return;
      }

      // Send to backend
      stompClientRef.current.send("/app/chat", {}, JSON.stringify(payload));

      // Removed local addition of sender's copy here to avoid duplicates
    },
    [onMessage, onStatus]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect();
      }
      stompClientRef.current = null;
    };
  }, []);

  return {
    stompClient: stompClientRef.current,
    connected,
    username,
    connectWS,
    disconnectWS,
    sendMessageWS,
  };
};
