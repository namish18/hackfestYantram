import React, { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import OrderForm from './components/OrderForm';
import OrderStatus from './components/OrderStatus';

function App() {
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (loginCredentials) => {
    setCredentials(loginCredentials);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ userId: '', password: '' });
    setOrderStatus(null);
  };

  const handlePlaceOrder = async (orderDetails) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: credentials.userId,
          password: credentials.password,
          orderDetails
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      setOrderStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Angel One Trading Platform</h1>
      </header>
      <main>
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="trading-dashboard">
            <div className="user-info">
              <p>Logged in as: <strong>{credentials.userId}</strong></p>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            <OrderForm onSubmit={handlePlaceOrder} />
            <OrderStatus status={orderStatus} loading={loading} error={error} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
