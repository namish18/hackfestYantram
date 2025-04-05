// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { SmartAPI } = require('smartapi-javascript');
const { authenticator } = require('otplib');
const cors = require('cors');
const https = require('https');

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

// Get holdings endpoint
app.get('/api/holdings', authenticate, async (req, res) => {
  try {
    const holdingData = await req.smart_api.getHolding();
    res.json({ success: true, data: holdingData });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holdings', error: error.message });
  }
});

// Get positions endpoint
app.get('/api/positions', authenticate, async (req, res) => {
  try {
    const positionData = await req.smart_api.getPosition();
    res.json({ success: true, data: positionData });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch positions', 
      error: error.message 
    });
  }
});

// Position conversion endpoint
app.post('/api/positions/convert', authenticate, async (req, res) => {
  try {
    const conversionParams = req.body;
    const conversionData = await req.smart_api.convertPosition(conversionParams);
    res.json({ success: true, data: conversionData });
  } catch (error) {
    console.error('Error converting position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert position',
      error: error.message
    });
  }
});


// Get quotes endpoint
app.get('/api/quotes', authenticate, async (req, res) => {
  try {
    const quoteParams = req.body;
    // Default parameters if none provided
    const params = quoteParams || {
      "mode": "FULL",
      "exchangeTokens": {
        "NSE": ["3045"]
      }
    };
    
    const quoteData = await req.smart_api.getQuotes(params);
    res.json({ success: true, data: quoteData });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quotes', 
      error: error.message 
    });
  }
});

// Historical candle data endpoint
app.post('/api/historical', authenticate, async (req, res) => {
  try {
    const { exchange, symboltoken, interval, fromdate, todate } = req.body;

    // Prepare request payload
    const postData = JSON.stringify({
      exchange,
      symboltoken,
      interval,
      fromdate,
      todate
    });

    // Prepare request options
    const options = {
      hostname: 'apiconnect.angelone.in',
      path: '/rest/secure/angelbroking/historical/v1/getCandleData',
      method: 'POST',
      headers: {
        'X-PrivateKey': API_KEY,
        'Accept': 'application/json',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': req.ip || 'CLIENT_LOCAL_IP',
        'X-ClientPublicIP': req.ip || 'CLIENT_PUBLIC_IP',
        'X-MACAddress': 'MAC_ADDRESS', // Replace with actual MAC address
        'X-UserType': 'USER',
        'Authorization': `Bearer ${req.jwtToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Make the HTTPS request
    const request = https.request(options, (response) => {
      let data = '';

      // Collect response data
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Handle end of response
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          res.json({ success: true, data: parsedData });
        } catch (error) {
          console.error('Error parsing response:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to parse response',
            error: error.message
          });
        }
      });
    });

    // Handle request errors
    request.on('error', (error) => {
      console.error('Error making HTTPS request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch historical data',
        error: error.message
      });
    });

    // Write the POST data and end the request
    request.write(postData);
    request.end();
  } catch (error) {
    console.error('Error processing historical data request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process historical data request',
      error: error.message
    });
  }
});

// Get Open Interest data endpoint
app.post('/api/oi', authenticate, async (req, res) => {
  try {
    const { exchange, symboltoken, interval, fromdate, todate } = req.body;
    
    const oiData = await req.smart_api.getOIData({
      exchange,
      symboltoken,
      interval,
      fromdate,
      todate
    });
    
    res.json({ success: true, data: oiData });
  } catch (error) {
    console.error('Error fetching OI data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch open interest data',
      error: error.message
    });
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