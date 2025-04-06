import React, { useState } from 'react';
import './TickerAnalysis.css';

const TickerAnalysis = () => {
  // State for ticker inputs and results
  const [tickerInputs, setTickerInputs] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Add a new input field
  const addInputField = () => {
    setTickerInputs([...tickerInputs, '']);
  };

  // Update an input field value
  const handleInputChange = (index, value) => {
    const newInputs = [...tickerInputs];
    newInputs[index] = value;
    setTickerInputs(newInputs);
  };

  // Remove an input field
  const removeInputField = (index) => {
    if (tickerInputs.length > 1) {
      const newInputs = [...tickerInputs];
      newInputs.splice(index, 1);
      setTickerInputs(newInputs);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Filter out empty ticker inputs
    const tickers = tickerInputs.filter(ticker => ticker.trim() !== '');
    
    if (tickers.length === 0) {
      setError('Please enter at least one ticker symbol');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/model/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }
      
      setResults(data.data);
    } catch (err) {
      setError(err.message || 'Failed to perform analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Render the results
  const renderResults = () => {
    if (!results) return null;

    // If results.output exists, it's a string output
    if (results.output) {
      return (
        <div className="results-container">
          <h3>Analysis Results</h3>
          <pre className="results-output">{results.output}</pre>
        </div>
      );
    }

    // Otherwise, render the JSON result in a structured way
    return (
      <div className="results-container">
        <h3>Analysis Results</h3>
        <div className="results-json">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="result-item">
              <h4>{key}</h4>
              {typeof value === 'object' ? (
                <pre>{JSON.stringify(value, null, 2)}</pre>
              ) : (
                <p>{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ticker-analysis-container">
      <h2>Stock Market Analysis</h2>
      
      <form onSubmit={handleSubmit} className="ticker-form">
        <div className="inputs-container">
          {tickerInputs.map((ticker, index) => (
            <div key={index} className="input-group">
              <input
                type="text"
                value={ticker}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="Enter ticker symbol (e.g., AAPL)"
                className="ticker-input"
              />
              
              {index === tickerInputs.length - 1 ? (
                <button 
                  type="button" 
                  className="add-button" 
                  onClick={addInputField}
                  aria-label="Add ticker"
                >
                  +
                </button>
              ) : (
                <button 
                  type="button" 
                  className="remove-button" 
                  onClick={() => removeInputField(index)}
                  aria-label="Remove ticker"
                >
                  −
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Tickers'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-indicator">
          <p>Processing your request...</p>
        </div>
      )}
      
      {renderResults()}
    </div>
  );
};

export default TickerAnalysis;