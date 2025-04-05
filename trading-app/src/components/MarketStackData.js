// MarketStackData.js
import React, { useState } from "react";
import axios from "axios";
import "./MarketStackData.css";

const MarketStackData = () => {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Note: The query parameter is now 'ticker'
      const response = await axios.get(`http://localhost:5000/api/marketstack?ticker=${ticker}`);
      if (response.data.success) {
        setStockData(response.data.data);
        setError(null);
      } else {
        setStockData(null);
        setError("No data found for the provided ticker.");
      }
    } catch (err) {
      console.error("Error fetching stock data:", err.message);
      setError("Failed to retrieve data. Please check the ticker.");
      setStockData(null);
    }
  };

  return (
    <div className="marketstack-container">
      <h1 className="marketstack-title">MarketStack Explorer</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Stock Ticker (e.g., AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <button onClick={fetchData}><strong>Get Data</strong></button>
      </div>

      {error && <p className="error">{error}</p>}

      {stockData && (
        <div className="stock-output">
          <div className="stock-card"><strong>Date:</strong> {stockData.date}</div>
          <div className="stock-card"><strong>Open:</strong> ${stockData.open}</div>
          <div className="stock-card"><strong>Close:</strong> ${stockData.close}</div>
          <div className="stock-card"><strong>High:</strong> ${stockData.high}</div>
          <div className="stock-card"><strong>Low:</strong> ${stockData.low}</div>
          <div className="stock-card"><strong>Volume:</strong> {stockData.volume}</div>
        </div>
      )}
    </div>
  );
};

export default MarketStackData;