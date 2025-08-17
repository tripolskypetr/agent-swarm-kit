---
title: demo/langchain-stream/readme
group: demo/langchain-stream
---

# LangChain Stream

Интеграция LangChain для streaming responses с поддержкой множественных AI провайдеров.

## Назначение

Демонстрирует возможности:
- LangChain интеграции для streaming
- Real-time потоковой передачи токенов
- Мультипровайдерной архитектуры
- Seamless интеграции с agent-swarm-kit

## Ключевые возможности

- **LangChain Streaming**: Real-time передача токенов
- **Multi-Provider Support**: Cohere, LMStudio, Ollama
- **Pharmaceutical Sales**: Тематический агент для продаж
- **Token-by-Token Response**: Плавная генерация ответов
- **Provider Fallback**: Автоматическое переключение провайдеров

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit + LangChain
- **Streaming**: LangChain streaming API
- **AI Providers**: Cohere, LMStudio, Ollama

## Структура проекта

```
src/
├── logic/
│   ├── agent/         # Triage агент
│   ├── completion/    # Streaming провайдеры
│   ├── enum/          # Перечисления
│   ├── swarm/         # Root swarm
│   └── tools/         # Add to cart tool
└── index.ts           # Точка входа
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск
bun run src/index.ts
```

## Конфигурация

Создайте файл `.env`:

```env
COHERE_API_KEY=your_cohere_api_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Примеры использования

1. **Pharma консультация**: "Что поможет от головной боли?"
   - Ответ генерируется token-by-token в реальном времени

2. **Добавление в корзину**: "Добавьте аспирин"
   - Streaming подтверждение добавления

3. **Product questions**: "Какие у вас антибиотики?"
   - Плавная генерация списка продуктов

## LangChain преимущества

- **Streaming Performance**: Мгновенная отдача первых токенов
- **User Experience**: Отсутствие задержек в ответах
- **Provider Abstraction**: Единый интерфейс для разных AI
- **Error Handling**: Graceful fallback при проблемах

## Streaming Architecture

```
User Request → Agent Processing → LangChain → AI Provider
     ↓              ↓               ↓           ↓
Response ← Token Stream ← Completion ← Model Response
```

## Применение

Критично для:
- Interactive chat applications
- Real-time customer support
- Live consultations
- Educational assistants
- Entertainment bots

## Performance Benefits

- **Perceived Speed**: Ответы начинаются мгновенно
- **Engagement**: Пользователи видят прогресс генерации
- **Responsiveness**: Лучший UX compared to batch responses
- **Efficiency**: Optimal использование network bandwidth