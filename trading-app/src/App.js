import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import MutualFundExplorer from "./components/MutualFundTable";
import SignForm from "./components/SignForm";
import CryptoExplorer from './components/CryptoExplorer';
import StockScore from "./components/TickerAnalysis";
import AngelOneDashBoard from "./components/AngelOneDashBoard";
import LandingPage from "./components/LandingPage";
import ChatBot from "./components/ChatBot";

const AppWrapper = () => {
  const location = useLocation();
  const hideHeaderOn = ["/", "/signup"];

  return (
    <>
      {!hideHeaderOn.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignForm />} />
        <Route path="/mutualfund" element={<MutualFundExplorer />} />
        <Route path="/crypto" element={<CryptoExplorer />} />
        <Route path="/tickeranalysis" element={<StockScore />} />
        <Route path="/angelone" element={<AngelOneDashBoard />} />
        <Route path="/chatbot" element={<ChatBot />} />
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