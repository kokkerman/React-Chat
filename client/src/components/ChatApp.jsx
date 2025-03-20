import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import ChatMessage from "./ChatMessage";

function ChatApp({ username = "User" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const connectToServer = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setIsConnecting(true);
    console.log("Attempting to connect to socket server...");

    const socketServerPort = 5000;
    const socketUrl = `http://${window.location.hostname}:${socketServerPort}`;
    socketRef.current = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ["websocket", "polling"],
      forceNew: true,
    });

    socketRef.current.on("connect", () => {
      console.log(
        `Connected to server with socket ID: ${socketRef.current.id}`
      );
      setConnected(true);
      setConnectionError(null);
      setIsConnecting(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnectionError(`Connection error: ${error.message}`);
      setConnected(false);
      setIsConnecting(false);
    });

    socketRef.current.on("connect_timeout", () => {
      console.error("Socket connection timeout");
      setConnectionError("Connection timeout - server did not respond");
      setConnected(false);
      setIsConnecting(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log(`Disconnected from server. Reason: ${reason}`);
      setConnected(false);
      setConnectionError(`Disconnected: ${reason}`);
    });

    socketRef.current.on("initial_messages", (initialMessages) => {
      setMessages(initialMessages);
    });

    socketRef.current.on("new_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setTimeout(() => {
      if (messages.length === 0 && connected) {
        console.log("Trying REST API fallback...");
        fetch("http://localhost:5000/api/messages")
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetched ${data.length} messages via REST API`);
            setMessages(data);
          })
          .catch((error) => {
            console.error("Error fetching messages via REST API:", error);
          });
      }
    }, 3000);
  };

  useEffect(() => {
    connectToServer();

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (input.trim() === "" || !connected) return;

    console.log(`Sending message as ${username}: ${input}`);

    try {
      socketRef.current.emit("send_message", {
        content: input,
        sender: username,
      });

      const localMessage = {
        id: Date.now(),
        content: input,
        sender: username,
        timestamp: new Date().toISOString(),
      };

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setConnectionError(`Failed to send message: ${error.message}`);
    }
  };

  return (
    <div className="chat-app">
      {isConnecting && (
        <div className="connection-status connecting">
          Connecting to chat server...
        </div>
      )}

      {!connected && !isConnecting && (
        <div className="connection-status error">
          {connectionError || "Disconnected from server"}
          <button onClick={connectToServer} className="reconnect-button">
            Try to reconnect
          </button>
        </div>
      )}

      <div className="messages">
        {messages.length === 0 && connected && (
          <div className="empty-state">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {connected && (
        <div className="connection-indicator connected">
          Connected to chat server ✓
        </div>
      )}
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            connected ? "Type your message..." : "Reconnect to send messages"
          }
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || input.trim() === ""}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatApp;
