---
title: demo/repl-phone-seller/readme
group: demo/repl-phone-seller
---

# REPL Phone Seller

Интерактивная система продаж телефонов с comprehensive product database и semantic search.

## Назначение

Демонстрирует возможности:
- E-commerce sales агента с product knowledge
- Semantic search по характеристикам товаров
- Shopping basket management
- Интерактивного REPL интерфейса для продаж

## Ключевые возможности

- **Rich Product Database**: iPhone, Samsung, Google Pixel и другие
- **Semantic Search**: Поиск по любым характеристикам
- **Diagonal Search**: Специализированный поиск по размеру экрана
- **Basket Management**: Полноценная корзина покупок
- **Sales Agent**: Профессиональный продавец с product expertise

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **ML**: TensorFlow.js для embeddings и search
- **Database**: JSON product catalog
- **AI Providers**: OpenAI, LMStudio, Ollama

## Структура проекта

```
├── data/
│   └── phones.json        # Product database
├── src/
│   ├── config/
│   │   ├── openai.ts     # OpenAI конфигурация
│   │   └── setup.ts      # Система setup
│   ├── logic/
│   │   ├── agent/        # Sales агент
│   │   ├── completion/   # Multiple AI providers
│   │   ├── embedding/    # Nomic embeddings
│   │   ├── storage/      # Phone и basket storage
│   │   ├── swarm/        # Root swarm
│   │   └── tools/        # Search и basket tools
│   ├── main/
│   │   └── repl.ts       # REPL интерфейс
│   └── model/            # Data models
└── logs/                 # Client session logs
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск REPL
bun run src/main/repl.ts
```

## Конфигурация

Создайте файл `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Product Database

База содержит детальную информацию о телефонах:

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

## Примеры использования

### Product Search
- "Покажи iPhone с большим экраном"
- "Какие Samsung есть до 500 долларов?"
- "Телефон с хорошей камерой для фото"

### Diagonal Search
- "Найди телефоны с диагональю 6.5 дюймов"
- "Какие модели больше 6 дюймов?"

### Basket Operations
- "Добавь iPhone 15 Pro в корзину"
- "Что у меня в корзине?"
- "Сколько будет стоить вся корзина?"

### Product Comparison
- "Сравни iPhone 15 и Samsung Galaxy S24"
- "Чем отличается Pixel 8 от Pixel 8 Pro?"

## AI-Powered Features

### Semantic Understanding
- Понимание естественного языка
- Контекстный поиск по характеристикам
- Интеллектуальные рекомендации

### Sales Expertise
- Product knowledge и specifications
- Price comparisons и recommendations
- Upselling и cross-selling

### Basket Intelligence
- Smart product suggestions
- Price optimization recommendations
- Inventory management

## Применение

Идеально для:
- E-commerce platforms
- Retail sales assistants
- Product recommendation systems
- Customer service automation
- Inventory management

## Расширение возможностей

Легко добавить:
- Больше категорий товаров
- Payment processing
- Shipping calculations
- User accounts и history
- Review и rating systems