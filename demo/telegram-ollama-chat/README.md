---
title: demo/telegram-ollama-chat/readme
group: demo/telegram-ollama-chat
---

# Telegram Ollama Chat

Telegram бот с pharmaceutical sales system, поддержкой multiple interfaces и local Ollama AI.

## Назначение

Демонстрирует возможности:
- Telegram Bot API интеграции с agent-swarm-kit
- Multi-interface support (Telegram, REPL, Web)
- Local AI с Ollama для privacy и cost efficiency
- Pharmaceutical sales system с product database

## Ключевые возможности

- **Telegram Integration**: Полноценный Telegram бот
- **Multi-Interface**: Telegram, REPL, Web interface
- **Local AI**: Ollama для privacy и offline work
- **Pharma Sales**: Специализированная система продаж
- **Product Database**: База фармацевтических товаров
- **TensorFlow Embeddings**: Semantic search по продуктам

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Bot Framework**: Telegraf
- **Web Framework**: Hono
- **AI Provider**: Ollama (local)
- **ML**: TensorFlow.js для embeddings

## Структура проекта

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
│   │   ├── agent/        # Sales и triage агенты
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

## Установка и запуск

```bash
# Установка Ollama
curl https://ollama.ai/install.sh | sh

# Скачивание модели
ollama pull llama2

# Установка зависимостей
bun install

# Запуск Telegram бота
bun run src/main/telegram.ts

# Запуск Web сервера (опционально)
bun run src/main/hono.ts

# Запуск REPL (опционально)
bun run src/main/repl.ts
```

## Конфигурация

Создайте файл `.env`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2
WEB_PORT=3000
```

## Создание Telegram бота

1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Выберите имя и username для бота
4. Получите API token
5. Добавьте token в `.env`

## Примеры использования

### В Telegram
- "Привет! Что у вас есть от головной боли?"
- "Покажи все витамины"
- "Добавь аспирин в корзину"
- "Что поможет от простуды?"

### В Web интерфейсе
Откройте `http://localhost:3000` для web-версии

### В REPL
Интерактивная командная строка для тестирования

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

## Ollama Преимущества

- **Privacy**: Данные не покидают ваш сервер
- **Cost Efficiency**: Никаких API costs
- **Offline Work**: Работает без интернета
- **Customization**: Возможность fine-tuning
- **Performance**: Оптимизирован для локального использования

## Multi-Interface Architecture

```
Telegram Bot ←→ Agent Swarm ←→ Ollama
Web Interface ←→      ↑       ←→ Storage
REPL Console ←→       ↓       ←→ Embeddings
```

## Применение

Идеально для:
- Pharmaceutical businesses
- Healthcare consultations
- E-commerce bots
- Customer service automation
- Privacy-sensitive applications

## Развитие

Может быть расширен:
- Prescription management
- Doctor consultations
- Inventory tracking
- Order processing
- Payment integration