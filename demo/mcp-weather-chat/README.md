---
title: demo/mcp-weather-chat/readme
group: demo/mcp-weather-chat
---

# MCP Weather Chat

Интеграция Model Context Protocol (MCP) для взаимодействия с внешними weather сервисами.

## Назначение

Демонстрирует возможности:
- Интеграции MCP для внешних сервисов
- Weather API интеграции через протокол
- Tool calling через MCP server
- Расширяемой архитектуры для внешних данных

## Ключевые возможности

- **MCP Integration**: Model Context Protocol для external tools
- **Weather Service**: Real-time погодные данные
- **Server Architecture**: Отдельный MCP server
- **Tool Calling**: Structured function calling для погоды
- **Extensible Design**: Легкое добавление новых сервисов

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Protocol**: Model Context Protocol (MCP)
- **External APIs**: Weather services

## Структура проекта

```
src/
├── config/
│   └── mcp.ts         # MCP конфигурация
├── repl.ts           # REPL интерфейс
└── lib/
    └── swarm.ts      # Swarm конфигурация
server/
└── src/
    └── index.ts      # MCP server
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск MCP server (терминал 1)
cd server && bun run src/index.ts

# Запуск клиента (терминал 2)
bun run src/repl.ts
```

## Конфигурация

Создайте файл `.env`:

```env
WEATHER_API_KEY=your_weather_api_key
MCP_SERVER_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_api_key
```

## Примеры использования

1. **Текущая погода**: "Какая погода в Москве?"
2. **Прогноз**: "Прогноз на завтра для Санкт-Петербурга"
3. **Сравнение**: "Сравни погоду в Москве и Лондоне"
4. **Планирование**: "Стоит ли брать зонт в Сочи сегодня?"

## MCP Преимущества

- **Standardized Protocol**: Единый стандарт для внешних сервисов
- **Type Safety**: Structured data exchange
- **Extensibility**: Легкое добавление новых tools
- **Isolation**: Отдельные серверы для разных сервисов

## Применение

Отлично для:
- Weather applications
- Travel planning assistants
- Outdoor activity recommendations
- Agricultural advice systems
- Event planning tools

## Расширение

MCP архитектура позволяет добавить:
- News services
- Stock market data
- Translation services
- Calendar integration
- Maps and navigation