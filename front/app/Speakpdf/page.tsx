"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import styles from "./Dashboard.module.css";
import axios, { AxiosError } from "axios";
import Navbar from "../components/Navbar";

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

  // Function to refresh the token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setError("No refresh token available. Please log in again.");
        return null;
      }

      const response = await axios.post("http://localhost:8000/api/token/refresh/", {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setError("Failed to refresh token. Please log in again.");
      } else {
        setError("An unknown error occurred while refreshing the token.");
      }
      console.error("Failed to refresh token", error);
      return null;
    }
  };

  // Handle form submission
  // Function to handle form submission
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  let token = localStorage.getItem("accessToken");

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
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        // Token might be expired, attempt to refresh it
        token = await refreshToken();
        if (token) {
          handleSubmit(e);
        } else {
          setError("Unauthorized: Please log in again.");
        }
      } else {
        setError("Failed to communicate with Django API");
      }
    } else {
      setError("An unknown error occurred.");
    }
    console.error("Error:", error);
  }
};


  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // Toggle chatbot visibility
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
