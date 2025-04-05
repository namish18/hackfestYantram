import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import companyLogo from "../assets/company.png";
import mutualfundIcon from "../assets/MutualFund.png";
import stockIcon from "../assets/Stock.png";
import cryptoIcon from "../assets/CryptoCurrency.png";
import avatarImg from "../assets/Avatar.jpg";

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={companyLogo} alt="Company Logo" className="logo" />
      </div>
      <nav className="nav">
        <Link to="/mutualfund" className="nav-link">
          <img src={mutualfundIcon} alt="Mutual Fund" className="nav-icon" />
          Mutual Fund
        </Link>
        <Link to="/stock" className="nav-link">
          <img src={stockIcon} alt="Stock" className="nav-icon" />
          Stock
        </Link>
        <Link to="/crypto" className="nav-link">
          <img src={cryptoIcon} alt="Crypto" className="nav-icon" />
          Crypto
        </Link>
      </nav>
      <div className="avatar-container">
        <Link to="/profile">
          <img src={avatarImg} alt="User Avatar" className="avatar" />
        </Link>
      </div>
    </header>
  );
};

export default Header;