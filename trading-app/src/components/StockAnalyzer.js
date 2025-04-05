// src/pages/StockAnalyzer.js
import React, { useState } from "react";
import "./StockAnalyzer.css";

const StockAnalyzer = () => {
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeStock = async () => {
    setError("");
    setResult(null);
    if (!ticker.trim()) {
      setError("Please enter a stock ticker.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/model/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker }),
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Error fetching stock data. Make sure the backend is running.");
    }
  };

  return (
    <div className="stock-analyzer-container">
      <h1>Stock Analyzer</h1>
      <input
        type="text"
        placeholder="Enter Stock Ticker (e.g., AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <button onClick={analyzeStock}>Analyze</button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-card">
          <h2>{result.ticker}</h2>
          <p><strong>Price:</strong> ${result.price}</p>
          <p><strong>Trust Score:</strong> {result.trustScore}</p>
          <p><strong>Rating:</strong> {result.rating}</p>
          <p><strong>Risk Category:</strong> {result.riskCategory}</p>
        </div>
      )}
    </div>
  );
};

export default StockAnalyzer;