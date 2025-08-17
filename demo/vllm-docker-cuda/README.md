---
title: demo/vllm-docker-cuda/readme
group: demo/vllm-docker-cuda
---

# VLLM Docker CUDA

Self-hosted inference с VLLM engine, CUDA acceleration и Docker контейнеризацией для local AI deployment.

## Назначение

Демонстрирует возможности:
- Self-hosted AI inference с VLLM
- CUDA GPU acceleration для performance
- Docker контейнеризации AI services
- OpenAI-compatible API endpoint

## Ключевые возможности

- **VLLM Engine**: Optimized inference для large language models
- **CUDA Support**: GPU acceleration для fast responses
- **Docker Deployment**: Containerized для easy deployment
- **OpenAI API Compatible**: Drop-in replacement для OpenAI API
- **Model Flexibility**: Support для любых HuggingFace models

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Inference Engine**: VLLM
- **GPU Support**: CUDA
- **Containerization**: Docker с NVIDIA runtime
- **Model Source**: HuggingFace Hub

## Структура проекта

```
├── docker-compose.yaml   # Docker services
├── model/               # Model storage
├── src/
│   ├── repl.ts         # REPL interface
│   └── lib/
│       └── swarm.ts    # Swarm configuration
└── index.ts            # Entry point
```

## Требования к системе

- **NVIDIA GPU**: CUDA-compatible
- **Docker**: с NVIDIA Container Runtime
- **RAM**: Минимум 8GB (16GB+ рекомендуется)
- **Storage**: 10GB+ для модели

## Установка и запуск

### 1. NVIDIA Container Runtime
```bash
# Ubuntu/Debian
sudo apt install nvidia-container-runtime

# Restart Docker
sudo systemctl restart docker
```

### 2. Deploy VLLM Service
```bash
# Clone и setup
git clone <repository>
cd vllm-docker-cuda

# Запуск VLLM сервера
docker-compose up -d vllm-server

# Проверка статуса
docker-compose logs vllm-server
```

### 3. Agent-Swarm Setup
```bash
# Установка зависимостей
bun install

# Запуск клиента
bun run src/repl.ts
```

## Конфигурация

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
# Замена модели в docker-compose.yaml
--model microsoft/DialoGPT-medium
# на
--model meta-llama/Llama-2-7b-chat-hf
```

## Performance Optimization

### GPU Memory Management
```bash
# Мониторинг GPU
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

## Применение

Идеально для:
- Self-hosted AI applications
- Privacy-sensitive deployments
- High-performance inference
- Cost optimization (no API fees)
- Custom model deployment

## Преимущества Self-Hosting

- **Privacy**: Данные остаются локальными
- **Cost Control**: Нет per-token charges
- **Customization**: Fine-tuned models
- **Performance**: Dedicated GPU resources
- **Reliability**: Полный контроль over infrastructure

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
- **Out of memory**: Reduce model size или batch size
- **Model loading fails**: Check HuggingFace model path
- **API not responding**: Verify container networking