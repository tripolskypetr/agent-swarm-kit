---
title: demo/cohere-token-rotate/readme
group: demo/cohere-token-rotate
---

# Cohere Token Rotate

Система ротации токенов с поддержкой множественных AI провайдеров и LangChain интеграцией.

## Назначение

Демонстрирует возможности:
- Ротации API токенов между различными провайдерами
- Интеграции множественных AI сервисов (Cohere, LMStudio, Ollama)
- Балансировки нагрузки между провайдерами
- LangChain streaming интеграции

## Ключевые возможности

- **Token Rotation**: Автоматическая ротация между API ключами
- **Multi-Provider Support**: Cohere, LMStudio, Ollama
- **LangChain Integration**: Streaming responses через LangChain
- **Load Balancing**: Распределение запросов между провайдерами
- **Fallback System**: Автоматическое переключение при ошибках

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Streaming**: LangChain
- **AI Providers**: Cohere AI, LMStudio, Ollama

## Структура проекта

```
src/
├── logic/
│   ├── agent/         # Triage агент
│   ├── completion/    # Различные провайдеры
│   ├── enum/          # Перечисления
│   ├── swarm/         # Конфигурация swarm
│   └── tools/         # Инструменты
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
COHERE_API_KEY_2=your_backup_cohere_key
LMSTUDIO_API_URL=http://localhost:1234
OLLAMA_API_URL=http://localhost:11434
```

## Примеры использования

1. **Автоматическая ротация**: Система автоматически переключается между провайдерами
2. **High Availability**: При недоступности одного провайдера используется другой
3. **Cost Optimization**: Балансировка для оптимизации затрат
4. **Performance**: Выбор наиболее быстрого доступного провайдера

## Преимущества ротации

- **Надежность**: Устойчивость к сбоям отдельных провайдеров
- **Экономия**: Распределение запросов для снижения costs
- **Масштабируемость**: Легкое добавление новых провайдеров
- **Производительность**: Оптимальное использование ресурсов

## Применение

Критично для:
- Production-ready систем
- High-load приложений
- Enterprise решений
- SaaS платформ с гарантией uptime