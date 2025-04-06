import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/logo_short.png';
import logoImage from '../assets/logo_long.png';
import "./LandingPage.css";

const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const handleModalToggle = () => setShowModal(!showModal);

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
              <Link to="/stock">Stock Analysis</Link>
              <a href="#contact">Contact</a>
            </div>
            {/* Navbar Buttons */}
            <div className="nav-buttons">
              <Link to="/signup" className="sign-in-btn">Sign In</Link>
              <Link to="/signup" className="get-started-btn">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
                <button onClick={handleModalToggle} className="learn-more-btn">
                  Learn More
                </button>
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

      {/* ILNB Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img src={logoImage} alt="ILNB Finserv Logo" className="modal-logo" />
            <p className="modal-text">
              ILNB Finserv, officially known as the ILNB Group of Financial Services, is a Mumbai-based financial services firm founded in 2017. The company operates as a small partnership firm with a team of 2–10 employees, specializing in financial planning, mutual funds, portfolio management, and insurance services. Branded as "Your Financial Doctor," ILNB Finserv emphasizes personalized financial solutions to help clients make informed decisions about investments, insurance, and expenses. Their aim is to provide dedicated and unbiased assistance to achieve both short-term and long-term financial goals while fostering enduring client relationships. The company is headquartered at Sandhurst Building, Opera House, Mumbai.
            </p>
            <a
              href="https://ilnb.co.in/"
              className="ilnb-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              MOVE TO ILNB FINSERV
            </a>
            <button onClick={handleModalToggle} className="close-btn">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;