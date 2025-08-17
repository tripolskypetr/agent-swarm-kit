---
title: demo/vllm-docker-cuda/readme
group: demo/vllm-docker-cuda
---

# VLLM Docker CUDA

Self-hosted inference with VLLM engine, CUDA acceleration and Docker containerization for local AI deployment.

## Purpose

Demonstrates capabilities:
- Self-hosted AI inference with VLLM
- CUDA GPU acceleration for performance
- Docker containerization of AI services
- OpenAI-compatible API endpoint

## Key Features

- **VLLM Engine**: Optimized inference for large language models
- **CUDA Support**: GPU acceleration for fast responses
- **Docker Deployment**: Containerized for easy deployment
- **OpenAI API Compatible**: Drop-in replacement for OpenAI API
- **Model Flexibility**: Support for any HuggingFace models

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Inference Engine**: VLLM
- **GPU Support**: CUDA
- **Containerization**: Docker with NVIDIA runtime
- **Model Source**: HuggingFace Hub

## Project Structure

```
├── docker-compose.yaml   # Docker services
├── model/               # Model storage
├── src/
│   ├── repl.ts         # REPL interface
│   └── lib/
│       └── swarm.ts    # Swarm configuration
└── index.ts            # Entry point
```

## System Requirements

- **NVIDIA GPU**: CUDA-compatible
- **Docker**: with NVIDIA Container Runtime
- **RAM**: Minimum 8GB (16GB+ recommended)
- **Storage**: 10GB+ for model

## Installation and Setup

### 1. NVIDIA Container Runtime
```bash
# Ubuntu/Debian
sudo apt install nvidia-container-runtime

# Restart Docker
sudo systemctl restart docker
```

### 2. Deploy VLLM Service
```bash
# Clone and setup
git clone <repository>
cd vllm-docker-cuda

# Start VLLM server
docker-compose up -d vllm-server

# Check status
docker-compose logs vllm-server
```

### 3. Agent-Swarm Setup
```bash
# Install dependencies
bun install

# Start client
bun run src/repl.ts
```

## Configuration

### Docker Compose
```yaml
services:
  vllm-server:
    image: vllm/vllm-openai:latest
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    command: >
      --model microsoft/DialoGPT-medium
      --host 0.0.0.0
      --port 8000
    ports:
      - "8000:8000"
```

### Environment Variables
```env
VLLM_API_URL=http://localhost:8000/v1
VLLM_MODEL=microsoft/DialoGPT-medium
CUDA_VISIBLE_DEVICES=0
```

## Supported Models

### Popular Options
- **LLaMA 2**: Meta's open-source LLM
- **Mistral**: Efficient multilingual model
- **CodeLlama**: Code generation specialist
- **Vicuna**: Chat-optimized model
- **WizardCoder**: Programming assistant

### Model Selection
```bash
# Replace model in docker-compose.yaml
--model microsoft/DialoGPT-medium
# with
--model meta-llama/Llama-2-7b-chat-hf
```

## Performance Optimization

### GPU Memory Management
```bash
# GPU monitoring
nvidia-smi

# Memory usage
docker stats vllm-server
```

### VLLM Parameters
```yaml
command: >
  --model microsoft/DialoGPT-medium
  --tensor-parallel-size 1
  --max-num-batched-tokens 4096
  --max-num-seqs 256
```

## API Usage

### OpenAI-Compatible Endpoints
```bash
# Chat completions
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "microsoft/DialoGPT-medium",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Model Information
```bash
# Available models
curl http://localhost:8000/v1/models
```

## Use Cases

Ideal for:
- Self-hosted AI applications
- Privacy-sensitive deployments
- High-performance inference
- Cost optimization (no API fees)
- Custom model deployment

## Self-Hosting Benefits

- **Privacy**: Data stays local
- **Cost Control**: No per-token charges
- **Customization**: Fine-tuned models
- **Performance**: Dedicated GPU resources
- **Reliability**: Complete infrastructure control

## Monitoring

```bash
# Container health
docker-compose ps

# Logs
docker-compose logs -f vllm-server

# GPU utilization
watch nvidia-smi

# API health check
curl http://localhost:8000/health
```

## Troubleshooting

### Common Issues
- **CUDA not found**: Install NVIDIA drivers
- **Out of memory**: Reduce model size or batch size
- **Model loading fails**: Check HuggingFace model path
- **API not responding**: Verify container networking