import yfinance as yf
import pandas as pd
import numpy as np
import json
import argparse
import sys
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout

TF_ENABLE_ONEDNN_OPTS=0

def parse_args():
    parser = argparse.ArgumentParser(description='Stock analysis with manual or automatic data')
    parser.add_argument('--tickers', type=str, help='Comma-separated list of tickers')
    parser.add_argument('--data_file', type=str, help='JSON file containing manual data')
    parser.add_argument('--data_json', type=str, help='JSON string containing manual data')
    return parser.parse_args()

def get_data(args):
    # If data is provided via JSON file
    if args.data_file:
        with open(args.data_file, 'r') as f:
            data_dict = json.load(f)
        return pd.DataFrame.from_dict(data_dict)
    
    # If data is provided via JSON string
    if args.data_json:
        data_dict = json.loads(args.data_json)
        return pd.DataFrame.from_dict(data_dict)
    
    # Otherwise, use tickers to fetch data
    tickers = args.tickers.split(',') if args.tickers else ['AAPL', 'MSFT', 'GOOGL']
    data = yf.download(tickers, period='2y', auto_adjust=False)['Adj Close']
    return data

# Calculate trust score (based on manager experience, performance consistency)
def calculate_trust_score(ticker_data, returns, risk):
    # Create features for the trust score model
    # Performance consistency features
    rolling_returns = returns.rolling(window=30).mean() # 30-day rolling average returns
    return_volatility = returns.rolling(window=30).std() # Volatility of returns
    
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
        
        if len(ticker_features) < 50: # Check if we have enough data
            trust_scores[ticker] = 0.5 # Default score
            continue
        
        # Create and train a simple neural network
        model = Sequential([
            Dense(32, activation='relu', input_shape=(ticker_features.shape[1],)),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid') # Output between 0 and 1 (trust score)
        ])
        
        # Create synthetic labels based on future performance
        future_return = returns[ticker].shift(-30).dropna()
        
        # Ensure indices align
        common_idx = ticker_features.index.intersection(future_return.index)
        if len(common_idx) < 30: # Not enough overlapping data
            trust_scores[ticker] = 0.5 # Default score
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

def assign_ratings(trust_scores, risk, tickers):
    
    star_ratings = {}
    risk_categories = []
    
    # Process each ticker
    for i, ticker in enumerate(tickers):
        trust_score = trust_scores[ticker]
        risk_value = risk[i]
        
        # Assign stars (1-5) based on trust score
        if trust_score >= 0.8:
            star_ratings[ticker] = 5 # Excellent trust score
        elif trust_score >= 0.6:
            star_ratings[ticker] = 4 # Very good trust score
        elif trust_score >= 0.4:
            star_ratings[ticker] = 3 # Average trust score
        elif trust_score >= 0.2:
            star_ratings[ticker] = 2 # Below average trust score
        else:
            star_ratings[ticker] = 1 # Poor trust score
        
        # Assign risk category based on risk value
        if risk_value < 0.01:
            risk_categories.append("Low")

        elif risk_value < 0.025:
            risk_categories.append("Medium")

        else:
            risk_categories.append("High")
    
    return star_ratings, risk_categories

# Build recommendation engine
def recommend_switch(fund_a, fund_b, mean_returns, risk):
    if (mean_returns[fund_a] > mean_returns[fund_b]) and (risk[fund_a] <= risk[fund_b]):
        return f"{fund_a} is better than {fund_b}: {mean_returns[fund_a]*100:.1f}% returns, same risk. Switch now?"
    return None

def main():
    args = parse_args()
    
    # Get data either manually or via API
    data = get_data(args)
    
    print(data)
    
    # Calculate metrics (returns, risk, etc.)
    returns = data.pct_change().dropna()
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    risk = np.sqrt(np.diag(cov_matrix))
    
    print(risk)
    
    # Calculate trust scores
    trust_scores = calculate_trust_score(data, returns, risk)
    
    # Print the trust scores
    print("Trust Scores:")
    for ticker, score in trust_scores.items():
        print(f"{ticker}: {score:.4f}")
    
    # Get ticker list
    tickers = data.columns.tolist()
    
    # Assign ratings
    star_ratings, risk_categories = assign_ratings(trust_scores, risk, tickers)
    
    # Create JSON output
    results = {
        "tickers": tickers,
        "mean_returns": mean_returns.tolist(),
        "risk": risk.tolist(),
        "trust_scores": trust_scores,
        "star_ratings": star_ratings,
        "risk_categories": risk_categories
    }
    
    # Output as JSON
    print(json.dumps(results))

if __name__ == "__main__":
    main()
