// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { SmartAPI } from 'smartapi-javascript';
import { authenticator } from 'otplib';
import cors from 'cors';
import https from 'https';
import http from 'http';
import mongoose from 'mongoose';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
// Add these imports at the top


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store credentials (in production, use environment variables)
const SECRET = process.env.SEC || authenticator.generateSecret();;
const API_KEY = process.env.KEY;
const CLIENT_ID =process.env.CLIENT_ID;
const PASSWORD = process.env.PASSWORD;

const uri = "mongodb://localhost:27017/";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));



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

// Enhanced user creation endpoint
app.post('/users', async (req, res) => {
  try {
    const { userId, password, brokers } = req.body;
    
    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and password are required' 
      });
    }

    // Create new user
    const newUser = new User({
      userId,
      password, // In production, this should be hashed
      brokers: brokers || []
    });

    await newUser.save();
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    // Check for validation errors (like duplicate userId)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID already exists or is invalid'
      });
    }
    
    console.error('User creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during user creation'
    });
  }
});

// New login endpoint
app.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and password are required' 
      });
    }

    // Find user in database
    const user = await User.findOne({ userId });
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login'
    });
  }
});


// GET endpoint to retrieve all users
app.get('/users', async (req, res) => {
  try {
    // Your code that might be parsing JSON
    const users = await User.find({});
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add a broker to a user
app.post('/users/:userId/brokers', async (req, res) => {
  try {
    const { brokerId, clientId, password } = req.body;
    
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.brokers.push({ brokerId, clientId, password });
    await user.save();
    
    res.status(201).json({ message: 'Broker added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

//  MarketStack API Endpoint
// app.get('/api/marketstack', async (req, res) => {
//   const symbol = req.query.symbol || 'AAPL';
//   const accessKey = '33f465c08eee9e5fa69e9e9f3cdb26bd';
//   const url = `http://api.marketstack.com/v1/eod?access_key=${accessKey}&symbols=${symbol}`;

//   http.get(url, (apiRes) => {
//     let data = '';

//     apiRes.on('data', (chunk) => data += chunk);
//     apiRes.on('end', () => {
//       try {
//         const parsed = JSON.parse(data);
//         res.json({ success: true, data: parsed });
//       } catch (err) {
//         res.status(500).json({ success: false, message: 'Failed to parse MarketStack data', error: err.message });
//       }
//     });
//   }).on('error', (err) => {
//     res.status(500).json({ success: false, message: 'Failed to fetch MarketStack data', error: err.message });
//   });
// });

// Add this with your other requires at the top
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');
// Add this new endpoint to your server.js
app.post('/api/model/analyze', async (req, res) => {
  try {
    const { tickers, data } = req.body;
    
    // Determine if we're using manual data or fetching by tickers
    let args = [];
    let tempFilePath;
    
    if (data) {
      // If manual data is provided, save it to a temporary file
      tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);
      fs.writeFileSync(tempFilePath, JSON.stringify(data));
      args = [path.join(__dirname, 'model.py'), '--data_file', tempFilePath];
    } else if (tickers && Array.isArray(tickers)) {
      // If only tickers are provided, pass them as an argument
      const tickersString = tickers.join(',');
      args = [path.join(__dirname, 'model.py'), '--tickers', tickersString];
    } else {
      // Use default tickers if nothing is provided
      args = [path.join(__dirname, 'model.py')];
    }

    // Spawn a Python process
    const pythonProcess = spawn('python', args);

    let dataFromPython = '';
    let errorFromPython = '';

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      dataFromPython += data.toString();
    });

    // Collect error messages from Python script
    pythonProcess.stderr.on('data', (data) => {
      errorFromPython += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      // Clean up temp file if it was created
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error: ${errorFromPython}`);
        return res.status(500).json({
          success: false,
          message: 'Python script execution failed',
          error: errorFromPython
        });
      }

      try {
        // Try to parse the output as JSON (look for the last valid JSON in case of debug prints)
        const jsonMatches = dataFromPython.match(/\{[\s\S]*\}/g);
        if (jsonMatches && jsonMatches.length > 0) {
          const lastJsonString = jsonMatches[jsonMatches.length - 1];
          const results = JSON.parse(lastJsonString);
          res.json({ success: true, data: results });
        } else {
          // If no JSON found, just return the string output
          res.json({
            success: true,
            data: {
              output: dataFromPython
            }
          });
        }
      } catch (err) {
        // If parsing fails, just return the string output
        res.json({
          success: true,
          data: {
            output: dataFromPython
          }
        });
      }
    });
  } catch (error) {
    console.error('Error executing Python script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute analysis',
      error: error.message
    });
  }
});

// app.get('/api/crypto', async (req, res) => {
//   try {
//     // Construct the Coinlayer API URL without callback for pure JSON
//     const url = 'http://api.coinlayer.com/live?access_key=23b45be2a1394357c6e991382a6810fb';
    
//     const response = await fetch(url);
    
//     if (!response.ok) {
//       throw new Error(`Coinlayer API responded with status: ${response.status}`);
//     }
    
//     // Parse JSON response
//     const data = await response.json();
    
//     // Return JSON data
//     res.json({
//       success: true,
//       data: data
//     });
//   } catch (error) {
//     console.error('Error fetching crypto data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch cryptocurrency data',
//       error: error.message
//     });
//   }
// });


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../src/build')));

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});