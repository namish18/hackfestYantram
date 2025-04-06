import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/logo_short.png';
import logoImage from '../assets/logo_long.png';
import "./LandingPage.css";
const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              <img src={logoImage} alt="Logo" />
            </Link>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#contact">Contact</a>
            </div>
            {/* Navbar Buttons */}
<div className="nav-buttons">
  <Link to="/signin" className="sign-in-btn">Sign In</Link>
  <Link to="/signform" className="get-started-btn">Get Started</Link>
</div>

          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                Track Your <span>Investments</span> Smartly
              </h1>
              <p className="hero-subtitle">
                Empower your financial journey with real-time data and intelligent insights.
              </p>
              <div className="hero-buttons">
                <Link to="/signup" className="start-investing-btn">
                  Start Investing
                </Link>
                <a href="#learn" className="learn-more-btn">
                  Learn More
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">1M+</span>
                  <span className="stat-label">Investors</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">$10B</span>
                  <span className="stat-label">Tracked Assets</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <img src={heroImage} alt="Investment Illustration" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;