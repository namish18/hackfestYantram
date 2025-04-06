import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

// Logo and Icons
import companyLogo from "../assets/company.png";
import mutualfundIcon from "../assets/MutualFund.png";
import stockIcon from "../assets/Stock.png";
import cryptoIcon from "../assets/CryptoCurrency.png";
import avatarImg from "../assets/Avatar.jpg";
import dashboardIcon from "../assets/Dashboard.png";
import settingsIcon from "../assets/Settings.png";
import logoutIcon from "../assets/LogOut.png";
import chatIcon from "../assets/chat.png"; // ✅ New ChatBot icon import

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleStockDropdown = () => setStockDropdownOpen((prev) => !prev);
  const toggleDashboardDropdown = () => setDashboardDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/";
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo-container">
        <img src={companyLogo} alt="Company Logo" className="logo" />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <Link to="/mutualfund" className="nav-link">
          <img src={mutualfundIcon} alt="Mutual Fund" className="nav-icon" />
          Mutual Funds
        </Link>

        <div className="nav-link dropdown" onClick={toggleStockDropdown}>
          <div className="nav-link-inner">
            <img src={stockIcon} alt="Stock" className="nav-icon" />
            Stocks
          </div>
          {stockDropdownOpen && (
            <div className="dropdown-content">
              <Link to="/stock" className="dropdown-item">Stock Analysis</Link>
              <Link to="/marketstack" className="dropdown-item">MarketStack</Link>
            </div>
          )}
        </div>

        <Link to="/crypto" className="nav-link">
          <img src={cryptoIcon} alt="Crypto" className="nav-icon" />
          Crypto
        </Link>
      </nav>

      {/* Avatar Dropdown */}
      <div className="avatar-container">
        <img src={avatarImg} alt="User Avatar" className="avatar" onClick={toggleDropdown} />
        {dropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={toggleDashboardDropdown}>
              <img src={dashboardIcon} alt="Dashboard" className="dropdown-icon" />
              Dashboard ▸
            </div>
            {dashboardDropdownOpen && (
              <div className="dropdown-submenu">
                <Link to="/angelone" className="dropdown-item submenu-item">AngelOne</Link>
              </div>
            )}

            {/* ✅ ChatBot with Icon */}
            <Link to="/chatbot" className="dropdown-item">
              <img src={chatIcon} alt="ChatBot" className="dropdown-icon" />
              AI ChatBot
            </Link>

            <Link to="/settings" className="dropdown-item">
              <img src={settingsIcon} alt="Settings" className="dropdown-icon" />
              Settings
            </Link>

            <div className="dropdown-item" onClick={handleLogout}>
              <img src={logoutIcon} alt="Logout" className="dropdown-icon" />
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;