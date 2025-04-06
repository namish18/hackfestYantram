import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

// Assets
import logoLong from "../assets/logo_long.png";
import avatarImg from "../assets/Avatar.jpg";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setDashboardDropdownOpen(false); // Close sub-dropdown if reopening main
  };

  const toggleDashboardDropdown = () => {
    setDashboardDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/";
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
        <Link to="/stocks" className="nav-link">Stocks</Link>
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