import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

// Assets
import logoLong from "../assets/logo_long.png";
import avatarImg from "../assets/Avatar.jpg";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [stocksDropdownOpen, setStocksDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setDashboardDropdownOpen(false);
  };

  const toggleDashboardDropdown = () => {
    setDashboardDropdownOpen((prev) => !prev);
  };

  const toggleStocksDropdown = () => {
    setStocksDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/";
  };

  const handleStockScoreClick = () => {
    navigate("/ticker-analysis");
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo-container">
        <img src={logoLong} alt="Company Logo" className="logo" />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <Link to="/mutualfund" className="nav-link">Mutual Funds</Link>

        <div className="nav-link dropdown-parent" onClick={toggleStocksDropdown}>
          Stocks
          {stocksDropdownOpen && (
            <div className="dropdown-submenu">
              <a
                href="https://stockanalysisyantram.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-item"
              >
                Stock Analysis
              </a>
              <div className="dropdown-item" onClick={handleStockScoreClick}>
                Stock Score
              </div>
            </div>
          )}
        </div>

        <Link to="/crypto" className="nav-link">Crypto</Link>
      </nav>

      {/* Profile Avatar */}
      <div className="avatar-container">
        <img
          src={avatarImg}
          alt="User Avatar"
          className="avatar"
          onClick={toggleDropdown}
        />

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={toggleDashboardDropdown}>
              Dashboard
            </div>

            {dashboardDropdownOpen && (
              <div className="dropdown-submenu center-submenu">
                <Link to="/angelone" className="submenu-angelone">
                  AngelOne
                </Link>
              </div>
            )}

            <Link to="/settings" className="dropdown-item">
              Settings
            </Link>

            <div className="dropdown-item" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;