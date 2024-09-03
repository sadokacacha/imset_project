"use client";

import { useState, useContext, FormEvent, ChangeEvent } from "react";
import styles from "./Dashboard.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import AuthContext from "../context/AuthContext";

interface ChatLogEntry {
  question: string;
  response: string;
}

export default function Speakpdf() {
  const [userInput, setUserInput] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const authContext = useContext(AuthContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let token = Cookies.get("access_token");
  
    if (!token) {
      setError("No access token available. Please log in again.");
      authContext?.logout();
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/chatbot/",
        { question: userInput, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponse(res.data.response);
      setContext(res.data.context);
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { question: userInput, response: res.data.response },
      ]);
      setUserInput(""); // Clear input field after submission
    } catch (error) {
      if (error instanceof axios.AxiosError && error.response?.status === 401) {
        // The Axios interceptor will handle token refresh, no need to manually call refreshToken
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to communicate with Django API.");
      }
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen((prevState) => !prevState);
  };

  return (
    <div className={styles.dashboard}>
      <Navbar />

      <main className={styles.main}>
        <header className={styles.header}>
          <h2>Hello, Mr Ladhari</h2>
          <p>Have a nice day</p>
        </header>
        <div className={styles.chatbotContainer}>
          <button className={styles.toggleButton} onClick={toggleChatbot}>
            {isChatbotOpen ? "Close Chatbot" : "Open Chatbot"}
          </button>
          {isChatbotOpen && (
            <div className={styles.chatbot}>
              <div className={styles.chatHeader}>Chat AI</div>
              <div className={styles.chatBody}>
                {chatLog.map((entry, index) => (
                  <div key={index}>
                    <div className={styles.userMessage}>
                      <strong>{entry.question}</strong>
                    </div>
                    <div className={styles.botMessage}>
                      <strong>{entry.response}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className={styles.chatFooter}>
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Type your question"
                  required
                />
                <button className={styles.envoyer} type="submit">
                  Send
                </button>
              </form>
              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
