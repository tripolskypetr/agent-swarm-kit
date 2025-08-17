---
title: demo/binance-candle-chat/readme
group: demo/binance-candle-chat
---

# Binance Candle Chat

Automated cryptocurrency trading system using agent-swarm-kit and Binance API.

## Purpose

Demonstrates multi-agent system capabilities for:
- Real-time market data analysis
- Trading operations management across various cryptocurrencies
- Trend prediction using TensorFlow.js
- Automated buy/sell order calculations

## Key Features

- **Multi-Agent Architecture**: Specialized agents for BTC, ETH, BNB, XRP, SOL
- **Triage Agent**: Routes users to appropriate trading agents
- **Binance API Integration**: Real-time candle data retrieval and order placement
- **ML Predictions**: TensorFlow.js for trend analysis
- **Portfolio Management**: Profit/loss tracking and order history

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **ML**: TensorFlow.js
- **API**: node-binance-api
- **AI Providers**: OpenAI, Ollama

## Project Structure

```
src/
├── api/           # Binance API methods
├── config/        # Binance and TensorFlow configuration
├── lib/           # Main swarm logic
└── utils/         # Calculation and parsing utilities
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Set environment variables
export BINANCE_API_KEY=your_api_key
export BINANCE_SECRET_KEY=your_secret_key

# Run
bun run src/repl.ts
```

## Configuration

Create a `.env` file with required API keys:

```env
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
OPENAI_API_KEY=your_openai_api_key
```

## Usage Examples

1. **BTC Analysis**: "Show Bitcoin analysis"
2. **ETH Purchase**: "I want to buy Ethereum for $100"
3. **Price Query**: "What's the SOL price?"
4. **Order History**: "Show my recent trades"

## Economic Benefits

- Automated trading decisions
- Reduced emotional factor in trading
- 24/7 market monitoring
- Quick response to price changes
