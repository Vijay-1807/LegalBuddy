import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { auth } from "./firebase";

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Chat from './pages/Chat';
import DocGenerator from './pages/DocGenerator';
import History from './pages/History';
import MyDocuments from './pages/MyDocuments';
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && window.location.pathname.startsWith('/app')) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="loading-container"><div>Loading...</div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes */}
      {user ? (
        <>
          <Route path="/" element={<Chat />} />
          <Route path="/generate-doc" element={<DocGenerator />} />
          <Route path="/history" element={<History />} />
          <Route path="/my-documents" element={<MyDocuments />} />
        </>
      ) : (
        <Route path="*" element={<Login />} />
      )}
    </Routes>
  );
}

export default App;
