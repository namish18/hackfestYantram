import React, { useEffect, useState } from "react";
import "./AngelOneDashBoard.css";

const AngelOneDashBoard = () => {
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [conversionData, setConversionData] = useState(null);
  const [conversionInput, setConversionInput] = useState({
    exchange: "",
    symboltoken: "",
    producttype: "",
    newproducttype: "",
    tradingsymbol: "",
    transactiontype: "",
    quantity: 0,
  });

  const fetchData = async () => {
    try {
      const [holdingsRes, positionsRes] = await Promise.all([
        fetch("/api/holdings"),
        fetch("/api/positions"),
      ]);

      const holdingsData = await holdingsRes.json();
      const positionsData = await positionsRes.json();

      if (holdingsData.success) setHoldings(holdingsData.data);
      if (positionsData.success) setPositions(positionsData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleConvert = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/positions/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversionInput),
      });

      const data = await res.json();
      if (data.success) {
        setConversionData(data.data);
        fetchData(); // Refresh after conversion
      }
    } catch (err) {
      console.error("Conversion failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="angelone-container">
      <h2>AngelOne Dashboard</h2>

      <div className="section">
        <h2 className="user-dashboard-title">
          User Dashboard <span className="client-id">Client ID: 5B6008C</span>
        </h2>
        <h3>Holdings</h3>
        <div className="cards">
          {holdings.map((item, index) => (
            <div className="card" key={index}>
              <p><strong>Symbol:</strong> {item.tradingsymbol}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Average Price:</strong> {item.averageprice}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Positions</h3>
        <div className="cards">
          {positions.map((item, index) => (
            <div className="card" key={index}>
              <p><strong>Symbol:</strong> {item.tradingsymbol}</p>
              <p><strong>Net Qty:</strong> {item.netqty}</p>
              <p><strong>Buy Avg:</strong> {item.buyavgprice}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Convert Position</h3>
        <div className="conversion-form">
          <div className="input-row">
            <input
              type="text"
              placeholder="exchange"
              value={conversionInput.exchange}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, exchange: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="symboltoken"
              value={conversionInput.symboltoken}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, symboltoken: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="producttype"
              value={conversionInput.producttype}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, producttype: e.target.value })
              }
            />
          </div>

          <div className="input-row">
            <input
              type="text"
              placeholder="newproducttype"
              value={conversionInput.newproducttype}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, newproducttype: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="tradingsymbol"
              value={conversionInput.tradingsymbol}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, tradingsymbol: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="transactiontype"
              value={conversionInput.transactiontype}
              onChange={(e) =>
                setConversionInput({ ...conversionInput, transactiontype: e.target.value })
              }
            />
          </div>

          <input
            className="full-width"
            type="number"
            placeholder="quantity"
            value={conversionInput.quantity}
            onChange={(e) =>
              setConversionInput({ ...conversionInput, quantity: e.target.value })
            }
          />

          <div className="convert-button">
            <button onClick={handleConvert}>Convert</button>
          </div>
        </div>

        {conversionData && (
          <div className="conversion-result">
            <strong>Conversion successful!</strong>
            <pre>{JSON.stringify(conversionData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AngelOneDashBoard;