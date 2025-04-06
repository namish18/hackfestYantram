import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.css";

// TODO: Replace this with your real key in a secure way (e.g., .env file)
const GEMINI_API_KEY = "YAIzaSyCjc37iGcJv9avFzm4ir68Lr1vMCyxruWoY";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your finance assistant. Ask me about any stock or investment advice.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const stockRegex = /\b[A-Z]{1,5}\b/g;
    const matches = input.match(stockRegex) || [];

    let stockDataMessage = "";

    for (const symbol of matches) {
      try {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`
        );
        const result = response.data.chart.result?.[0];

        if (!result) {
          throw new Error("No result returned");
        }

        const lastClose = result.meta.previousClose;
        const currentPrice = result.meta.regularMarketPrice;
        const change = (currentPrice - lastClose).toFixed(2);
        const percent = ((change / lastClose) * 100).toFixed(2);

        stockDataMessage += `📊 ${symbol}: $${currentPrice} (${change} / ${percent}%)\n`;
      } catch (err) {
        stockDataMessage += `⚠️ Couldn't fetch data for ${symbol}.\n`;
        console.error(`Stock fetch error for ${symbol}:`, err);
      }
    }

    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: `Act as a financial assistant. ${input}` }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const geminiText =
        geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't get a good response.";

      const botMessage = {
        sender: "bot",
        text: `${stockDataMessage}${geminiText}`,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error fetching Gemini response." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">💰 Finance Assistant</div>
      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder="Ask about stocks, investing tips, etc..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;