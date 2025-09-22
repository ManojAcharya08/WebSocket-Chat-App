// src/components/MessageInput.jsx
import React, { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import "../styles/global.css"

const MessageInput = () => {
  const { sendMessage, currentUser, connected, users } = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");

  // Send message handler
  const handleSend = () => {
    const trimmedMessage = message.trim();
    const trimmedReceiver = receiver.trim();

    if (!trimmedMessage) return;

    if (!connected) {
      alert("You are not connected!");
      return;
    }

    let target = null;
    if (trimmedReceiver) {
      // Match receiver ignoring case
      const match = users.find(
        (u) => u.toLowerCase() === trimmedReceiver.toLowerCase()
      );

      if (!match) {
        alert("Receiver not online!");
        return;
      }
      target = match;
    }

    // Send the message via ChatContext
    sendMessage(trimmedMessage, target);

    // Clear message after send
    setMessage("");
    if (target) setReceiver(""); // clear receiver only for private messages
  };

  // Trigger send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-input-bar">
      {/* Private message input */}
      <input
        type="text"
        id="privateReceiver"         
        name="privateReceiver"       
        list="users-list"
        placeholder="Send to (private: username)"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <datalist id="users-list">
        {users.filter((u) => u !== currentUser).map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      {/* Main message input */}
      <input
        type="text"
        id="chatMessage"             
        name="chatMessage"           
        placeholder="Message"
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Send button */}
      <button type="button" onClick={handleSend}>
        {receiver.trim() ? `Send to ${receiver.trim()}` : "Send to Everyone"}
      </button>
    </div>
  );
};

export default MessageInput;
