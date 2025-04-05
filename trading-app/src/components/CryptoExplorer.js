import React, { useEffect, useState } from 'react';
import './CryptoExplorer.css';
import { FaSearch } from 'react-icons/fa';

const CryptoExplorer = () => {
  const [cryptoData, setCryptoData] = useState(null);
  const [filter, setFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(9); // 3x3 layout

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/crypto');
        const json = await res.json();
        if (json.success) {
          setCryptoData(json.data);
        } else {
          console.error(json.message);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const getSortedFilteredData = () => {
    if (!cryptoData) return [];

    return Object.entries(cryptoData.rates)
      .filter(([symbol]) =>
        symbol.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => b[1] - a[1]);
  };

  const visibleCryptos = getSortedFilteredData().slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6); // Adds 2 more rows (2x3)
  };

  return (
    <div className="crypto-container">
      <h1 className="crypto-title">Explore Cryptocurrencies</h1>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by code name..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setVisibleCount(9);
          }}
        />
      </div>

      {cryptoData ? (
        <>
          <div className="crypto-grid">
            {visibleCryptos.map(([symbol, value]) => (
              <div className="crypto-card" key={symbol}>
                <h2>{symbol}</h2>
                <p>${value.toFixed(2)} USD</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="loading">Loading...</p>
      )}
    </div>
  );
};

export default CryptoExplorer;
