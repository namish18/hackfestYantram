// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import MutualFundExplorer from "./components/MutualFundTable";
import SignForm from "./components/SignForm";
import CryptoExplorer from './components/CryptoExplorer';
import StockAnalyzer from "./components/StockAnalyzer";
import MarketStackData from "./components/MarketStackData";
import AngelOneDashBoard from "./components/AngelOneDashBoard";


const AppWrapper = () => {
  const location = useLocation();
  const hideHeaderOn = ["/"];

  return (
    <>
      {!hideHeaderOn.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<SignForm />} />
        <Route path="/mutualfund" element={<MutualFundExplorer />} />
        <Route path="/crypto" element={<CryptoExplorer />} />
        <Route path="/stock" element={<StockAnalyzer />} />
        <Route path="/marketstack" element={<MarketStackData />} />
        <Route path="/angelone" element={<AngelOneDashBoard />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;