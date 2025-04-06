import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "./MutualFundTable.css";

const decodeISIN = (isin) => {
  if (typeof isin !== 'string' || isin.length !== 12) {
    throw new Error('Invalid ISIN: must be 12 characters long');
  }

  const countryCode = isin.substring(0, 2);
  const securityIdentifier = isin.substring(2, 11);
  const checkDigit = isin.charAt(11);

  if (!validateISINCheckDigit(isin)) {
    throw new Error('Invalid ISIN: checksum mismatch');
  }

  return { countryCode, securityIdentifier, checkDigit };
};

const validateISINCheckDigit = (isin) => {
  const digits = [];
  for (const c of isin) {
    if (/[A-Z]/.test(c)) {
      const num = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      digits.push(...num.toString().split('').map(Number));
    } else if (/\d/.test(c)) {
      digits.push(parseInt(c, 10));
    } else {
      throw new Error(`Invalid character in ISIN: ${c}`);
    }
  }

  let sum = 0;
  let evenPosition = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (evenPosition) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    evenPosition = !evenPosition;
  }

  return sum % 10 === 0;
};

const MutualFundExplorer = () => {
  const [data, setData] = useState([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.mfapi.in/mf");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    item.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.schemeCode.toString().includes(searchTerm)
  );

  const visibleFunds = filteredData.slice(0, displayCount);

  return (
    <div className="explorer-container">
      {/* Mutual Fund Analysis Button */}
      <div className="mutual-fund-analysis-button-container">
        <a
          href="https://mutualfundyantram.streamlit.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mutual-fund-analysis-button"
        >
          Mutual Fund Analysis
        </a>
      </div>

      <h2>Mutual Fund Explorer</h2>

      {/* Search Box */}
      <div className="search-container">
        <FaSearch className="search-icon-inside" />
        <input
          type="text"
          className="search-input"
          placeholder="Explore Mutual Funds"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Fund Cards */}
      <div className="card-grid">
        {visibleFunds.map((fund) => (
          <div key={fund.schemeCode} className="fund-card">
            <h3>{fund.schemeName}</h3>
            <p><strong>Scheme Code:</strong> {fund.schemeCode}</p>
            <p><strong>ISIN Growth:</strong> {fund.isinGrowth || "N/A"}</p>
            <p><strong>ISIN Div Reinvestment:</strong> {fund.isinDivReinvestment || "N/A"}</p>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {displayCount < filteredData.length && (
        <button className="show-more" onClick={() => setDisplayCount(displayCount + 6)}>
          Show More
        </button>
      )}
    </div>
  );
};

export default MutualFundExplorer;