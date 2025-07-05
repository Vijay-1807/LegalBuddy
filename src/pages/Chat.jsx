import React, { useState, useEffect, useRef } from 'react';
import { auth } from "../firebase"; // Import auth
import { signOut } from "firebase/auth"; // Import signOut
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaSearch, FaFileAlt, FaFolder, FaCog, FaSignOutAlt, FaPaperPlane, FaBars, FaTimes, FaUser, FaEnvelope, FaGavel, FaLanguage, FaBrain } from 'react-icons/fa';
import Footer from '../Components/Footer'; // Import Footer
import './Chat.css'; // Import Chat CSS
import { saveChatMessage, getChatHistory } from "../chatService";
import Layout from '../Components/Layout'; // Import the new Layout component

const ThemeToggle = ({ isDark, onToggle }) => (
  <label className="theme-switcher">
    <input type="checkbox" checked={!isDark} onChange={onToggle} />
    <span className="slider round"></span>
  </label>
);

function Chat() {
  const navigate = useNavigate(); // Initialize navigate
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const chatContainerRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [docGenForm, setDocGenForm] = useState({
    deponentName: '',
    address: '',
    statement: '',
  });
  const [languageMenu, setLanguageMenu] = useState({ open: false, messageId: null });
  const languages = ["Telugu", "Hindi", "Tamil", "Kannada"];

  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setContactForm(prev => ({ ...prev, name: currentUser.displayName || '', email: currentUser.email || '' }));
        setTimeout(() => setLoading(false), 500);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // Clear all local storage, including 'rememberedEmail'
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDocGenSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedDocument('');

    try {
      const res = await fetch("http://localhost:5000/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docGenForm),
      });

      if (!res.ok) {
        throw new Error("Failed to generate document from server.");
      }

      const data = await res.json();
      setGeneratedDocument(data.document || "Error: Could not parse the document.");

    } catch (err) {
      console.error("Document generation error:", err);
      setGeneratedDocument(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      from: "user",
      text: input,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    await saveChatMessage(userId, input, "user");
    setInput("");

    setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", text: "..." }]);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = data.response || "Sorry, I couldn't get a response.";
      const newBotMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: botReply,
        isProcessing: false,
        originalText: null,
      };
      await saveChatMessage(userId, botReply, "bot");

      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading
        newBotMessage,
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: Date.now() + 1, from: "bot", text: "Error: Could not reach the server." },
      ]);
    }
  };

  const startChat = () => {
    setHasChatStarted(true);
    setMessages([{ id: Date.now(), from: "bot", text: "Hello! How can I assist you today?" }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:bonthavijay1807@gmail.com?subject=Contact from ${contactForm.name}&body=${contactForm.message}`;
    setShowContactForm(false);
  };

  const handleShowHistory = async () => {
    if (!user) return;
    setShowHistory(true);
    setHistoryLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not logged in");
      setHistoryLoading(false);
      return;
    }
    const history = await getChatHistory(userId);
    setChatHistory(history);
    setHistoryLoading(false);
  };

  useEffect(() => {
    console.log("Updated chatHistory:", chatHistory);
  }, [chatHistory]);

  if (loading) {
    return <div className="loading-container"><div>Loading...</div></div>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleTextAction = async (messageId, action, options = {}) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const originalMessage = messages[messageIndex];

    // Toggle back to original if it exists and the same action is requested again
    if (originalMessage.originalText) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: msg.originalText, originalText: null } : msg
      ));
      return;
    }

    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, isProcessing: true } : msg
    );
    setMessages(updatedMessages);
    setLanguageMenu({ open: false, messageId: null }); // Close menu on action

    try {
      const res = await fetch("http://localhost:5000/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalMessage.text, action, ...options }),
      });

      if (!res.ok) {
        throw new Error("Failed to transform text.");
      }

      const data = await res.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              text: data.transformedText, 
              originalText: originalMessage.text, 
              isProcessing: false 
            } 
          : msg
      ));

    } catch (err) {
      console.error("Text transformation error:", err);
      // Revert on error
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isProcessing: false } : msg
      ));
    }
  };

  const toggleLanguageMenu = (messageId) => {
    if (languageMenu.open && languageMenu.messageId === messageId) {
      setLanguageMenu({ open: false, messageId: null });
    } else {
      setLanguageMenu({ open: true, messageId });
    }
  };

  const showOriginal = (messageId) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, text: msg.originalText, originalText: null } : msg
    ));
  };

  return (
    <Layout>
      <div className="chat-view-container" ref={chatContainerRef}>
        {hasChatStarted ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.from === 'user' ? 'user-message' : 'bot-message'}${msg.text === '...' ? ' loading' : ''}`}
            >
              <div className="message-content">{msg.text}</div>

              {msg.originalText && (
                <button onClick={() => showOriginal(msg.id)} className="original-text-toggle">
                  Show Original
                </button>
              )}

              {msg.from === 'bot' && msg.text !== '...' && !msg.originalText && (
                <div className="message-actions">
                  <button 
                    onClick={() => handleTextAction(msg.id, 'simplify')} 
                    title="Simplify"
                    disabled={msg.isProcessing}
                    className={msg.isProcessing ? 'processing' : ''}
                  >
                    <FaBrain /> {msg.isProcessing && '...'}
                  </button>
                  <div className="translate-container">
                    <button 
                      onClick={() => toggleLanguageMenu(msg.id)} 
                      title="Translate"
                      disabled={msg.isProcessing}
                      className={msg.isProcessing ? 'processing' : ''}
                    >
                      <FaLanguage /> {msg.isProcessing && '...'}
                    </button>
                    {languageMenu.open && languageMenu.messageId === msg.id && (
                      <div className="language-menu">
                        {languages.map(lang => (
                          <button key={lang} onClick={() => handleTextAction(msg.id, 'translate', { targetLanguage: lang })}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="welcome-container">
            <h1 className="chat-welcome-heading">Hello, {user?.displayName || user?.email?.split('@')[0] || "User"}</h1>
            <button className="start-chat-button" onClick={startChat}>Start Chat</button>
          </div>
        )}
      </div>

      {hasChatStarted && (
        <div className="chat-input-area">
          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask Legal Buddy anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="send-button"><FaPaperPlane /></button>
          </form>
          <Footer />
        </div>
      )}
    </Layout>
  );
}

export default Chat;
