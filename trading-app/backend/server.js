// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { SmartAPI } = require('smartapi-javascript');
const { authenticator } = require('otplib');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store credentials (in production, use environment variables)
const SECRET = process.env.SEC;
const API_KEY = process.env.KEY;
const CLIENT_ID =process.env.CLIENT_ID;
const PASSWORD = process.env.PASSWORD;

// Generate TOTP for authentication
function generateTOTP() {
  return authenticator.generate(SECRET);
}

// Initialize SmartAPI client
function initializeSmartAPI() {
  const smart_api = new SmartAPI({
    api_key: API_KEY
  });
  
  smart_api.setSessionExpiryHook(() => {
    console.log('Session expired, logging out');
    // Re-authentication logic can be implemented here
  });
  
  return smart_api;
}

// Authentication middleware
async function authenticate(req, res, next) {
  try {
    const smart_api = initializeSmartAPI();
    const sessionData = await smart_api.generateSession(CLIENT_ID, PASSWORD, generateTOTP());
    console.log('Session generated successfully');
    req.smart_api = smart_api;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
  }
}

// Place order endpoint
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const orderParams = req.body;
    const orderResponse = await req.smart_api.placeOrder(orderParams);
    res.json({ success: true, data: orderResponse });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
});

// Modify order endpoint
app.put('/api/orders/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const modifyParams = {
      ...req.body,
      orderid: orderId
    };
    
    const modifyResponse = await req.smart_api.modifyOrder(modifyParams);
    res.json({ success: true, data: modifyResponse });
  } catch (error) {
    console.error('Error modifying order:', error);
    res.status(500).json({ success: false, message: 'Failed to modify order', error: error.message });
  }
});

// Cancel order endpoint
app.delete('/api/orders/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const variety = req.query.variety || 'NORMAL';
    
    const cancelParams = {
      variety,
      orderid: orderId
    };
    
    const cancelResponse = await req.smart_api.cancelOrder(cancelParams);
    res.json({ success: true, data: cancelResponse });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
});

// Get order book endpoint
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orderBook = await req.smart_api.getOrderBook();
    res.json({ success: true, data: orderBook });
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order book', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});