import React from "react";

const isUrl = (str) => {
  const regex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return regex.test(str);
};

function ChatMessage({ message }) {
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const renderContent = () => {
    if (!message.content.includes("[") || !message.content.includes("]")) {
      if (isUrl(message.content)) {
        return (
          <a href={message.content} target="_blank" rel="noopener noreferrer">
            {message.content}
          </a>
        );
      }
      return <span>{message.content}</span>;
    }

    const parts = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(message.content.slice(lastIndex, match.index));
      }
      parts.push({ type: "image", src: match[1].trim() });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < message.content.length) {
      parts.push(message.content.slice(lastIndex));
    }

    return parts.map((part, index) => {
      if (typeof part === "string") {
        if (isUrl(part.trim())) {
          return (
            <a
              key={index}
              href={part.trim()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      } else if (part.type === "image") {
        return (
          <img
            key={index}
            src={part.src}
            alt="no image :("
            className="chat-image"
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="chat-message">
      <strong>{message.sender}: </strong>
      {renderContent()}
      <br />
      {formattedTime && <span className="message-time">{formattedTime}</span>}
    </div>
  );
}

export default ChatMessage;
