// src/components/MessageItem.jsx
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import "../styles/global.css";

const MessageItem = ({ message }) => {
  const { username, currentUser } = useContext(ChatContext);

  // Use the latest username fallback
  const me = username || currentUser;

  // Check if the message is private and relevant to me
  const isPrivate =
    message.receiver && (message.receiver === me || message.sender === me);

  // Determine CSS class for the message
  const className =
    message.sender === "System"
      ? "system"
      : message.sender === me
      ? "me"
      : "other";

  // Determine display name for the sender: show "Me" if message sender is current user
  const displayName = message.sender === me ? "Me" : message.sender;

  // Format message display text
  let displayText;
  if (message.sender === "System") {
    displayText = message.content;
  } else if (isPrivate) {
    displayText =
      message.sender === me
        ? `${displayName} (private) to ${message.receiver}: ${message.content}`
        : `From ${message.sender} (private): ${message.content}`;
  } else {
    displayText = `${displayName}: ${message.content}`;
  }

  return (
    <li className={`${className} ${isPrivate ? "private" : ""}`}>
      <span className="message-time">{message.formattedTimestamp || ""}</span>
      <div className="message-content">{displayText}</div>
    </li>
  );
};

export default MessageItem;
