---
title: demo/firebase-support-chat/readme
group: demo/firebase-support-chat
---

# Firebase Support Chat

Система customer support с Firebase real-time database для персистентности сообщений.

## Назначение

Демонстрирует возможности:
- Интеграции Firebase для real-time персистентности
- Создания professional support системы
- Обработки customer queries через агентов
- Масштабируемой архитектуры для support команд

## Ключевые возможности

- **Firebase Integration**: Real-time database для сообщений
- **Support Agent**: Специализированный operator agent
- **Message Persistence**: Автоматическое сохранение истории
- **Real-time Updates**: Мгновенная синхронизация между клиентами
- **Scalable Architecture**: Готовность к масштабированию

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Database**: Firebase Realtime Database
- **AI Providers**: OpenAI, Ollama

## Структура проекта

```
src/
├── config/
│   └── firebase.ts    # Firebase конфигурация
├── utils/
│   ├── saveMessage.ts # Сохранение сообщений
│   └── watchMessages.ts # Мониторинг изменений
├── repl.ts           # REPL интерфейс
└── lib/
    └── swarm.ts      # Конфигурация swarm
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Настройка Firebase
# 1. Создайте проект в Firebase Console
# 2. Включите Realtime Database
# 3. Получите конфигурацию

# Запуск
bun run src/repl.ts
```

## Конфигурация

Создайте файл `.env`:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
OPENAI_API_KEY=your_openai_api_key
```

## Примеры использования

1. **Support запросы**: "У меня проблема с оплатой"
2. **Техническая поддержка**: "Не работает функция X"
3. **Общие вопросы**: "Как пользоваться продуктом?"
4. **Эскалация**: Передача сложных вопросов оператору

## Firebase преимущества

- **Real-time синхронизация**: Мгновенные обновления
- **Автоматическое масштабирование**: Управляемая Google инфраструктура
- **Offline support**: Работа без подключения к интернету
- **Security rules**: Гибкая настройка доступа

## Применение

Идеально для:
- Customer support центров
- Help desk систем
- Технической поддержки SaaS
- E-commerce support
- Образовательных платформ

## Развитие

Может быть расширен:
- Системой тикетов
- Приоритизацией запросов
- Analytics и reporting
- Multi-language support