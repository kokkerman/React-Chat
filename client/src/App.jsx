import React, { useState, useEffect } from "react";
import ChatApp from "./components/ChatApp";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("chat-username");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUsernameSet(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("chat-username", username);
      setIsUsernameSet(true);
    }
  };

  return (
    <div className={`App${darkMode ? " dark" : ""}`}>
      <h1>Chat</h1>
      <button onClick={toggleDarkMode} className="toggle-btn">
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      
      {!isUsernameSet ? (
        <div className="username-form">
          <h2>Enter your username to join the chat</h2>
          <form onSubmit={handleSetUsername}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="username-input"
            />
            <button type="submit" className="username-submit">Join Chat</button>
          </form>
        </div>
      ) : (
        <ChatApp username={username} />
      )}
    </div>
  );
}

export default App;
