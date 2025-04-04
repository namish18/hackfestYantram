import React, { useState } from 'react';

function OrderForm({ onSubmit }) {
  const [orderDetails, setOrderDetails] = useState({
    variety: 'NORMAL',
    tradingsymbol: 'INFY-EQ',
    symboltoken: '1594',
    transactiontype: 'BUY',
    exchange: 'NSE',
    ordertype: 'MARKET',
    producttype: 'INTRADAY',
    duration: 'DAY',
    quantity: 5,
    price: 0,
    squareoff: 0,
    stoploss: 0,
    triggerprice: 0,
    disclosedquantity: 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = ['quantity', 'price', 'squareoff', 'stoploss', 'triggerprice', 'disclosedquantity'];
    const finalValue = numericFields.includes(name) ? Number(value) : value;
    
    setOrderDetails({
      ...orderDetails,
      [name]: finalValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(orderDetails);
  };

  return (
    <div className="order-form-container">
      <h2>Place New Order</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Trading Symbol</label>
            <input 
              type="text" 
              name="tradingsymbol" 
              value={orderDetails.tradingsymbol} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Symbol Token</label>
            <input 
              type="text" 
              name="symboltoken" 
              value={orderDetails.symboltoken} 
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Transaction Type</label>
            <select 
              name="transactiontype" 
              value={orderDetails.transactiontype} 
              onChange={handleChange}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Exchange</label>
            <select 
              name="exchange" 
              value={orderDetails.exchange} 
              onChange={handleChange}
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="NFO">NFO</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Order Type</label>
            <select 
              name="ordertype" 
              value={orderDetails.ordertype} 
              onChange={handleChange}
            >
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
              <option value="STOPLOSS_LIMIT">STOPLOSS LIMIT</option>
              <option value="STOPLOSS_MARKET">STOPLOSS MARKET</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Product Type</label>
            <select 
              name="producttype" 
              value={orderDetails.producttype} 
              onChange={handleChange}
            >
              <option value="INTRADAY">INTRADAY</option>
              <option value="DELIVERY">DELIVERY</option>
              <option value="MARGIN">MARGIN</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              name="quantity" 
              value={orderDetails.quantity} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Disclosed Quantity</label>
            <input 
              type="number" 
              name="disclosedquantity" 
              value={orderDetails.disclosedquantity} 
              onChange={handleChange}
            />
          </div>
        </div>

        {orderDetails.ordertype !== 'MARKET' && (
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                name="price" 
                value={orderDetails.price} 
                onChange={handleChange}
                step="0.05"
              />
            </div>
            
            <div className="form-group">
              <label>Trigger Price</label>
              <input 
                type="number" 
                name="triggerprice" 
                value={orderDetails.triggerprice} 
                onChange={handleChange}
                step="0.05"
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Square Off</label>
            <input 
              type="number" 
              name="squareoff" 
              value={orderDetails.squareoff} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Stop Loss</label>
            <input 
              type="number" 
              name="stoploss" 
              value={orderDetails.stoploss} 
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration</label>
            <select 
              name="duration" 
              value={orderDetails.duration} 
              onChange={handleChange}
            >
              <option value="DAY">DAY</option>
              <option value="IOC">IOC</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Variety</label>
            <select 
              name="variety" 
              value={orderDetails.variety} 
              onChange={handleChange}
            >
              <option value="NORMAL">NORMAL</option>
              <option value="STOPLOSS">STOPLOSS</option>
              <option value="AMO">AMO</option>
              <option value="BRACKET">BRACKET</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-order-btn">Place Order</button>
      </form>
    </div>
  );
}

export default OrderForm;
