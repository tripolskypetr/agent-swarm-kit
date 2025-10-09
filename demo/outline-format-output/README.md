---
title: demo/outline-format-output/readme
group: demo/outline-format-output
---

# Structured JSON Output

Integration with Ollama models through the agent-swarm-kit framework for structured data extraction and AI-driven processing.

## Purpose

Demonstrates capabilities:
- Ollama AI model integration
- Structured data extraction
- JSON-based response formatting
- Validation and error handling
- Asynchronous processing with history tracking

## Key Features

- **Ollama Integration**: Access to local Ollama models (e.g., Gemma3:4b)
- **Structured Data Extraction**: Extracts formatted data from unstructured input
- **JSON Repair**: Ensures valid JSON output using `jsonrepair`
- **Validation**: Custom rules for data integrity (e.g., positive age)
- **History Tracking**: Maintains conversation context for processing

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **AI Provider**: Ollama
- **Protocols**: HTTP (Ollama API)

## Project Structure

```
src/
├── repl.ts            # REPL interface for testing
└── lib/
    └── swarm.ts       # Swarm and completion configuration
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start REPL
bun run src/repl.ts
```

## Configuration

Create a `.env` file:

```env
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:4b
KEEP_ALIVE=24h
```

## Ollama Setup

### Prerequisites
1. Install [Ollama](https://ollama.ai/) locally
2. Pull the desired model (e.g., `ollama pull gemma3:4b`)
3. Ensure Ollama server is running on `http://127.0.0.1:11434`

### Supported Models
- **Gemma3:4b**: Lightweight, efficient model for structured tasks
- **Other Models**: Any model supported by Ollama (e.g., LLaMA, Mistral)

## Usage Examples

### Data Extraction
- "Extract name and age from: John Doe is 30 years old"
- "Parse: Alice Smith, age 25, lives in New York"
- "Extract data from: Bob is a 40-year-old engineer"

### Structured Output
```json
{
  "name": "John Doe",
  "age": 30
}
```

### Error Handling
- Input: "Mike is -5 years old"
  - Output: Error: "Age must be positive"

## Model Comparison

| Feature | Gemma3:4b |
|---------|-----------|
| Reasoning | Good |
| Speed | Fast |
| Cost | Free (local) |
| Multimodal | No |

## API Features

### Completion Endpoint
```bash
# Extract structured data
POST /api/completion
{
  "message": "John Doe is 30 years old",
  "completion": "test_completion"
}
```

### Response Format
- JSON object with `name` and `age`
- Validated to ensure positive age
- Repaired JSON for consistency

## Performance Optimization

### Model Selection
- **Gemma3:4b**: Ideal for lightweight, local processing
- **Keep-Alive**: Configurable model persistence (default: 24h)
- **Validation**: Prevents invalid data from propagating

### Caching
- Outline history for context-aware processing
- Local model execution for low latency
- JSON repair for robust output

## Use Cases

Ideal for:
- Data extraction from unstructured text
- Local AI processing without cloud dependency
- Rapid prototyping of AI-driven applications
- Educational tools for structured data handling
- Lightweight automation scripts

## Development Features

### Hot Reload
```bash
# Development mode with auto-reload
bun --watch src/repl.ts
```

### Debugging
```javascript
// Enable debug logging
process.env.DEBUG = "true"
```

### Testing
```bash
# Test data extraction
bun run test:completion
```

## Production Deployment

### Docker
```dockerfile
FROM oven/bun:latest
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### Environment
```bash
# Production environment
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT=100
```

## Callbacks and Validation

- **onValidDocument**: Saves valid results to `./dump/outline`
- **Validations**: Ensures age is positive, throws error if invalid
- **History Tracking**: Pushes user input to conversation history

## Notes

- Requires local Ollama server running
- JSON output is automatically repaired for consistency
- Extensible for additional validations or models
- Lightweight and suitable for low-resource environments
