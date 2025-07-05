import React, { useState, useEffect } from "react";
import { auth, googleProvider, githubProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

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
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate("/");
    } catch (error) {
      let errorMessage = "An error occurred during sign in.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      let errorMessage = "An error occurred during Google sign in.";
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign in was cancelled. Please try again.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign in was cancelled. Please try again.";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/");
    } catch (error) {
      let errorMessage = "An error occurred during GitHub sign in.";
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign in was cancelled. Please try again.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign in was cancelled. Please try again.";
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
      <h1
  className="logo-text animated-gradient-text"
  style={{
    fontSize: "2.8rem",
    lineHeight: "1.2",
    marginBottom: "2rem"
  }}
>
  ⚖️ <span className="animated-gradient">Legal Buddy</span>
</h1>

        {error && <div className="error-message">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              className={`auth-input ${emailError ? 'error' : ''}`}
              placeholder="Email Address"
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
          <div className="input-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-buttons-container">
          <button 
            onClick={handleGoogleSignIn}
            className="google-auth-button"
            disabled={isLoading}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="google-icon"
            />
            Sign in
          </button>

          <button 
            onClick={handleGithubSignIn}
            className="github-auth-button"
            disabled={isLoading}
          >
            <img 
              src="https://github.com/favicon.ico" 
              alt="GitHub" 
              className="github-icon"
            />
            Sign in
          </button>
        </div>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
