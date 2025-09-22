// src/components/ChatContainer.jsx
import React, { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import UserList from "./UserList";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import "../styles/global.css"

const ChatContainer = () => {
  const { messages, currentUser, status, connect, disconnect, sendMessage, users } =
    useContext(ChatContext);

  const [nameInput, setNameInput] = useState("");

  // Handle login
  const handleLogin = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;
    connect(trimmedName);
    setNameInput("");
  };

  // Handle sending messages
  const handleSendMessage = (content, receiver) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    sendMessage(trimmedContent, receiver?.trim() || null);
  };

  // Logged out view
  if (!currentUser) {
    return (
      <div className="chat-login">
        <h2>Enter Your Name</h2>
        <input
          autoFocus
          type="text"
          id="loginName"
          name="loginName"
          placeholder="Your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          autoComplete="username"
        />
        <button type="button" onClick={handleLogin}>
          Join Chat
        </button>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h2>Chat Room</h2>
        <span
          className={`status ${status === "Connected" ? "connected" : "disconnected"}`}
        >
          Status: {status}
        </span>
        <button type="button" className="leave-btn" onClick={disconnect}>
          Leave Chat
        </button>
      </div>

      {/* Body */}
      <div className="chat-body">
        {/* Online users */}
        <aside className="users-panel">
          <h3>-------------------------</h3>
          <UserList users={users} />
        </aside>

        {/* Messages and input */}
        <section className="messages-panel-container">
          <ul className="messages-panel" aria-live="polite">
            {messages.length === 0 && (
              <li className="no-messages">No messages yet</li>
            )}
            {messages.map((msg, idx) => (
              <MessageItem key={idx} message={msg} />
            ))}
          </ul>

          <MessageInput
            users={users}
            currentUser={currentUser}
            onSend={handleSendMessage}
          />
        </section>
      </div>
    </div>
  );
};

export default ChatContainer;
