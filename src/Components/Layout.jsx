import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FaSearch, FaFileAlt, FaFolder, FaCog, FaSignOutAlt, FaBars, FaTimes, FaUser, FaEnvelope, FaGavel } from 'react-icons/fa';

const ThemeToggle = ({ isDark, onToggle }) => (
  <label className="theme-switcher">
    <input type="checkbox" checked={!isDark} onChange={onToggle} />
    <span className="slider round"></span>
  </label>
);

function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setContactForm(prev => ({ ...prev, name: currentUser.displayName || '', email: currentUser.email || '' }));
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  
  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:bonthavijay1807@gmail.com?subject=Contact from ${contactForm.name}&body=${contactForm.message}`;
    setShowContactForm(false);
  };

  // Profile completion logic (for demo, just name and email)
  const profileFields = [user?.displayName, user?.email];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Copy email with toast
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user?.email);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 1500);
  };

  // Inline edit name logic
  const startEditName = () => {
    setEditedName(user?.displayName || '');
    setEditingName(true);
  };
  const saveEditName = () => {
    // In a real app, update in Firebase here
    user.displayName = editedName;
    setEditingName(false);
  };
  const cancelEditName = () => setEditingName(false);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="logo-text">⚖️ Legal Buddy</h3>
          <button className="close-sidebar-btn" onClick={toggleSidebar}><FaTimes /></button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}><FaSearch className="nav-icon" /> New Chat</NavLink>
          <NavLink to="/generate-doc" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}><FaGavel className="nav-icon" /> Generate Document</NavLink>
          <NavLink to="/history" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}><FaFileAlt className="nav-icon" /> History</NavLink>
          <NavLink to="/my-documents" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}><FaFolder className="nav-icon" /> My Documents</NavLink>
          <div className="nav-item" onClick={() => setShowAccountDetails(true)}><FaUser className="nav-icon" /> Account</div>
          <div className="nav-item" onClick={() => setShowContactForm(true)}><FaEnvelope className="nav-icon" /> Contact Us</div>
          <div className="nav-item">
            <FaCog className="nav-icon" />
            <span>Theme</span>
            <ThemeToggle isDark={isDarkTheme} onToggle={toggleTheme} />
          </div>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button-sidebar">
            <FaSignOutAlt className="nav-icon" /> Log Out
          </button>
        </div>
      </div>

      <main className="main-content">
        <button className="open-sidebar-btn" onClick={toggleSidebar}><FaBars /></button>
        {children}
      </main>

      {(showContactForm || showAccountDetails) && (
        <div className="modal-overlay" onClick={() => {setShowContactForm(false); setShowAccountDetails(false);}}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {showContactForm && (
              <form onSubmit={handleContactSubmit} className="contact-form">
                <h2>Contact Us</h2>
                <textarea placeholder="Your Message" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} required />
                <div className="form-buttons">
                  <button type="submit">Send Email</button>
                  <button type="button" onClick={() => setShowContactForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            {showAccountDetails && (
              <div className="account-details-card modal-animate">
                <button className="close-modal-btn" onClick={() => setShowAccountDetails(false)} title="Close">&times;</button>
                <div className="profile-progress-bar">
                  <div className="profile-progress" style={{ width: `${profileCompletion}%` }}></div>
                </div>
                <div className="account-avatar avatar-animated">
                  {user?.displayName
                    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                    : (user?.email ? user.email[0].toUpperCase() : '?')}
                </div>
                {editingName ? (
                  <div className="edit-name-row">
                    <input className="edit-name-input" value={editedName} onChange={e => setEditedName(e.target.value)} />
                    <button className="save-btn" onClick={saveEditName} title="Save">✔️</button>
                    <button className="cancel-btn" onClick={cancelEditName} title="Cancel">✖️</button>
                  </div>
                ) : (
                  <h2 className="account-name">
                    {user?.displayName || 'Not set'}
                    <button className="edit-name-btn" onClick={startEditName} title="Edit Name">✏️</button>
                  </h2>
                )}
                <div className="account-email-row">
                  <span className="account-email">{user?.email}</span>
                  <button className="copy-email-btn" onClick={handleCopyEmail} title="Copy Email">📋</button>
                </div>
                {showCopyToast && <div className="copy-toast">Copied!</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout; 