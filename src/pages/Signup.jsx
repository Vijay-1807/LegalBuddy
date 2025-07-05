import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import './Signup.css';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "#ff3366"
  });
  const navigate = useNavigate();

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

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "#ff3366";

    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    switch (score) {
      case 0:
      case 1:
        message = "Very Weak";
        color = "#ff3366";
        break;
      case 2:
        message = "Weak";
        color = "#ff9933";
        break;
      case 3:
        message = "Medium";
        color = "#ffcc00";
        break;
      case 4:
        message = "Strong";
        color = "#99cc33";
        break;
      case 5:
        message = "Very Strong";
        color = "#33cc33";
        break;
      default:
        message = "";
    }

    setPasswordStrength({ score, message, color });
  };

  useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
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
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div 
                  className="strength-bar"
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.message}
                </span>
              </div>
            )}
          </div>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
