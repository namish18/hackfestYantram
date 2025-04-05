import React from 'react';

function OrderStatus({ status, loading, error }) {
  if (loading) {
    return (
      <div className="order-status loading">
        <div className="spinner"></div>
        <p>Processing your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-status error">
        <h3>Order Failed</h3>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="order-status success">
      <h3>Order Status</h3>
      {status.success ? (
        <div>
          <p className="success-message">Order placed successfully!</p>
          <div className="response-data">
            <h4>Order Details:</h4>
            <pre>{JSON.stringify(status.data, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <p className="error-message">Failed to place order: {status.error}</p>
      )}
    </div>
  );
}

export default OrderStatus;
