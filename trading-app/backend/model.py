import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout


TF_ENABLE_ONEDNN_OPTS=0
# 1. Fetch data
tickers = ['AAPL', 'MSFT', 'GOOGL']
data = yf.download(tickers, period='2y', auto_adjust=False)['Adj Close']
print(data)
# 2. Calculate metrics (returns, risk, etc.)
returns = data.pct_change().dropna()
mean_returns = returns.mean()
cov_matrix = returns.cov()
risk = np.sqrt(np.diag(cov_matrix))
print(risk)
# 3. Calculate trust score (based on manager experience, performance consistency)
# This would be your custom implementation based on historical performance
def calculate_trust_score(ticker_data, returns, risk):
    # 1. Create features for the trust score model
    
    # Performance consistency features
    rolling_returns = returns.rolling(window=30).mean()  # 30-day rolling average returns
    return_volatility = returns.rolling(window=30).std()  # Volatility of returns
    
    # Trend consistency (how well the stock follows its trend)
    moving_avg_50 = ticker_data.rolling(window=50).mean()
    moving_avg_200 = ticker_data.rolling(window=200).mean()
    trend_consistency = (ticker_data - moving_avg_50).abs().rolling(window=30).mean()
    
    # Process each ticker separately to avoid dimension issues
    trust_scores = {}
    
    for ticker in ticker_data.columns:
        # Create features specific to this ticker
        ticker_features = pd.DataFrame({
            'rolling_returns': rolling_returns[ticker],
            'return_volatility': return_volatility[ticker],
            'trend_consistency': trend_consistency[ticker]
        })
        
        # Drop NaN values
        ticker_features = ticker_features.dropna()
        
        if len(ticker_features) < 50:  # Check if we have enough data
            trust_scores[ticker] = 0.5  # Default score
            continue
            
        # Create and train a simple neural network
        model = Sequential([
            Dense(32, activation='relu', input_shape=(ticker_features.shape[1],)),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')  # Output between 0 and 1 (trust score)
        ])
        
        # Create synthetic labels based on future performance
        future_return = returns[ticker].shift(-30).dropna()
        
        # Ensure indices align
        common_idx = ticker_features.index.intersection(future_return.index)
        if len(common_idx) < 30:  # Not enough overlapping data
            trust_scores[ticker] = 0.5  # Default score
            continue
            
        features_aligned = ticker_features.loc[common_idx]
        future_return_aligned = future_return.loc[common_idx]
        
        # Create binary labels (1 if return is above average)
        labels = (future_return_aligned > future_return_aligned.mean()).astype(int)
        
        # Split data
        split_idx = int(len(features_aligned) * 0.8)
        X_train = features_aligned.iloc[:split_idx].values
        X_test = features_aligned.iloc[split_idx:].values
        y_train = labels.iloc[:split_idx].values
        y_test = labels.iloc[split_idx:].values
        
        # Compile and train
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test), verbose=0)
        
        # Calculate trust score for this ticker
        latest_features = ticker_features.iloc[-1:].values
        trust_score = float(model.predict(latest_features)[0][0])
        
        # Adjust score based on risk
        risk_factor = risk[ticker_data.columns.get_loc(ticker)]
        risk_adjusted_score = trust_score * (1 - risk_factor)
        
        trust_scores[ticker] = risk_adjusted_score
        
    return trust_scores

trust_scores = calculate_trust_score(data, returns, risk)

# Print the trust scores
print("Trust Scores:")
for ticker, score in trust_scores.items():
    print(f"{ticker}: {score:.4f}")
# 4. Create risk parameters visualization (Safety Meter)
risk_categories = pd.cut(risk, bins=3, labels=['Low', 'Medium', 'High'])

# 5. Build recommendation engine
# Compare funds and generate recommendations
def recommend_switch(fund_a, fund_b):
    if (mean_returns[fund_a] > mean_returns[fund_b]) and (risk[fund_a] <= risk[fund_b]):
        return f"{fund_a} is better than {fund_b}: {mean_returns[fund_a]*100:.1f}% returns, same risk. Switch now?"
    return None
