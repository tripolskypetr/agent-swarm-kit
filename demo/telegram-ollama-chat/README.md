---
title: demo/telegram-ollama-chat/readme
group: demo/telegram-ollama-chat
---

# Telegram Ollama Chat

Telegram bot with pharmaceutical sales system, multiple interface support and local Ollama AI.

## Purpose

Demonstrates capabilities:
- Telegram Bot API integration with agent-swarm-kit
- Multi-interface support (Telegram, REPL, Web)
- Local AI with Ollama for privacy and cost efficiency
- Pharmaceutical sales system with product database

## Key Features

- **Telegram Integration**: Full-featured Telegram bot
- **Multi-Interface**: Telegram, REPL, Web interface
- **Local AI**: Ollama for privacy and offline work
- **Pharma Sales**: Specialized sales system
- **Product Database**: Pharmaceutical products database
- **TensorFlow Embeddings**: Semantic product search

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Bot Framework**: Telegraf
- **Web Framework**: Hono
- **AI Provider**: Ollama (local)
- **ML**: TensorFlow.js for embeddings

## Project Structure

```
├── data/
│   └── products.json      # Pharmaceutical products
├── src/
│   ├── config/
│   │   ├── hono.ts       # Hono web config
│   │   ├── logger.ts     # Logging setup
│   │   ├── swarm.ts      # Swarm config
│   │   └── tf.ts         # TensorFlow config
│   ├── logic/
│   │   ├── agent/        # Sales and triage agents
│   │   ├── completion/   # Ollama completion
│   │   ├── embedding/    # Ollama embeddings
│   │   ├── storage/      # Pharma storage
│   │   └── swarm/        # Root swarm
│   ├── main/
│   │   ├── hono.ts       # Web server
│   │   ├── repl.ts       # REPL interface
│   │   └── telegram.ts   # Telegram bot
│   └── utils/
│       └── getChatData.ts # Chat utilities
├── public/
│   └── index.html        # Web interface
└── logs/                 # Application logs
```

## Installation and Setup

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Download model
ollama pull llama2

# Install dependencies
bun install

# Start Telegram bot
bun run src/main/telegram.ts

# Start Web server (optional)
bun run src/main/hono.ts

# Start REPL (optional)
bun run src/main/repl.ts
```

## Configuration

Create a `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2
WEB_PORT=3000
```

## Creating Telegram Bot

1. Find @BotFather in Telegram
2. Send `/newbot`
3. Choose name and username for bot
4. Get API token
5. Add token to `.env`

## Usage Examples

### In Telegram
- "Hello! What do you have for headaches?"
- "Show all vitamins"
- "Add aspirin to cart"
- "What helps with cold?"

### In Web Interface
Open `http://localhost:3000` for web version

### In REPL
Interactive command line for testing

## Pharmaceutical Database

```json
{
  "name": "Аспирин",
  "category": "Обезболивающие",
  "price": 25.50,
  "description": "От головной боли и температуры",
  "contraindications": ["Язва желудка", "Беременность"],
  "dosage": "1-2 таблетки 3 раза в день"
}
```

## Ollama Benefits

- **Privacy**: Data doesn't leave your server
- **Cost Efficiency**: No API costs
- **Offline Work**: Works without internet
- **Customization**: Fine-tuning capability
- **Performance**: Optimized for local usage

## Multi-Interface Architecture

```
Telegram Bot ←→ Agent Swarm ←→ Ollama
Web Interface ←→      ↑       ←→ Storage
REPL Console ←→       ↓       ←→ Embeddings
```

## Use Cases

Ideal for:
- Pharmaceutical businesses
- Healthcare consultations
- E-commerce bots
- Customer service automation
- Privacy-sensitive applications

## Development

Can be extended with:
- Prescription management
- Doctor consultations
- Inventory tracking
- Order processing
- Payment integration