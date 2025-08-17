---
title: demo/repl-phone-seller/readme
group: demo/repl-phone-seller
---

# REPL Phone Seller

Interactive phone sales system with comprehensive product database and semantic search.

## Purpose

Demonstrates capabilities:
- E-commerce sales agent with product knowledge
- Semantic search by product characteristics
- Shopping basket management
- Interactive REPL interface for sales

## Key Features

- **Rich Product Database**: iPhone, Samsung, Google Pixel and others
- **Semantic Search**: Search by any characteristics
- **Diagonal Search**: Specialized screen size search
- **Basket Management**: Full shopping cart
- **Sales Agent**: Professional seller with product expertise

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **ML**: TensorFlow.js for embeddings and search
- **Database**: JSON product catalog
- **AI Providers**: OpenAI, LMStudio, Ollama

## Project Structure

```
├── data/
│   └── phones.json        # Product database
├── src/
│   ├── config/
│   │   ├── openai.ts     # OpenAI configuration
│   │   └── setup.ts      # System setup
│   ├── logic/
│   │   ├── agent/        # Sales agent
│   │   ├── completion/   # Multiple AI providers
│   │   ├── embedding/    # Nomic embeddings
│   │   ├── storage/      # Phone and basket storage
│   │   ├── swarm/        # Root swarm
│   │   └── tools/        # Search and basket tools
│   ├── main/
│   │   └── repl.ts       # REPL interface
│   └── model/            # Data models
└── logs/                 # Client session logs
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start REPL
bun run src/main/repl.ts
```

## Configuration

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Product Database

The database contains detailed phone information:

```json
{
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "price": 999,
  "diagonal": 6.1,
  "storage": ["128GB", "256GB", "512GB", "1TB"],
  "colors": ["Natural Titanium", "Blue", "White", "Black"],
  "features": ["A17 Pro chip", "Pro camera system", "Action Button"]
}
```

## Usage Examples

### Product Search
- "Show me iPhones with large screens"
- "What Samsung phones are under $500?"
- "Phone with good camera for photos"

### Diagonal Search
- "Find phones with 6.5 inch diagonal"
- "What models are bigger than 6 inches?"

### Basket Operations
- "Add iPhone 15 Pro to cart"
- "What's in my cart?"
- "How much will the whole cart cost?"

### Product Comparison
- "Compare iPhone 15 and Samsung Galaxy S24"
- "What's the difference between Pixel 8 and Pixel 8 Pro?"

## AI-Powered Features

### Semantic Understanding
- Natural language understanding
- Contextual search by characteristics
- Intelligent recommendations

### Sales Expertise
- Product knowledge and specifications
- Price comparisons and recommendations
- Upselling and cross-selling

### Basket Intelligence
- Smart product suggestions
- Price optimization recommendations
- Inventory management

## Use Cases

Ideal for:
- E-commerce platforms
- Retail sales assistants
- Product recommendation systems
- Customer service automation
- Inventory management

## Extension Capabilities

Easy to add:
- More product categories
- Payment processing
- Shipping calculations
- User accounts and history
- Review and rating systems