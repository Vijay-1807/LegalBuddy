import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import './Login.css'; // We can reuse the same styles

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      setMessage("Password reset instructions have been sent to your email. Please check your inbox and follow the link to reset your password.");
    } catch (error) {
      let errorMessage = "An error occurred while sending the reset email.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your email address and we'll send you instructions to reset your password.</p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!isEmailSent ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                className={`auth-input ${emailError ? 'error' : ''}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                required
                disabled={isLoading}
              />
              {emailError && <span className="input-error">{emailError}</span>}
            </div>
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">Sending...</span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="reset-success">
            <p className="success-text">Check your email for the reset link.</p>
            <p className="email-note">If you don't see the email, please check your spam folder.</p>
          </div>
        )}
        
        <div className="auth-link">
          Remember your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
} 