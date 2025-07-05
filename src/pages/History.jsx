import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { getChatHistory } from '../chatService';
import { auth } from '../firebase';
import './Chat.css'; // Re-using chat styles for consistency

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async (userId) => {
      setLoading(true);
      const chatHistory = await getChatHistory(userId);
      setHistory(chatHistory);
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchHistory(user.uid);
      } else {
        // Handle case where user is not logged in, though routes should prevent this
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return <span className="timestamp">Just now</span>;
    }
    return (
      <span className="timestamp">
        {new Date(timestamp.seconds * 1000).toLocaleString()}
      </span>
    );
  };

  return (
    <Layout>
      <div className="history-page">
        <h1>Chat History</h1>
        <div className="history-container">
          {loading ? (
            <div className="loading-history">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="no-history">No previous chats found.</div>
          ) : (
            <div className="history-list">
              {history.map((msg, idx) => (
                <div key={idx} className={`history-message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                  <div className="message-content">{msg.message}</div>
                  {renderTimestamp(msg.timestamp)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default History; 