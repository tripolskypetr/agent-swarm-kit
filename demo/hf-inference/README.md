---
title: demo/hf-inference/readme
group: demo/hf-inference
---

# HuggingFace Inference

Экономичная интеграция с HuggingFace Inference API для доступа к OpenAI gpt-oss-120b модели.

## Назначение

Демонстрирует возможности:
- Интеграции с HuggingFace Inference API
- Использования OpenAI-совместимых моделей с существенной экономией
- Cost-effective решения для AI приложений (~$15/месяц vs $100/месяц у grok-3-mini)
- Seamless перехода от дорогих к доступным AI провайдерам

## Ключевые возможности

- **HuggingFace Integration**: Доступ к gpt-oss-120b через HF API
- **OpenAI Compatibility**: Полная совместимость с OpenAI chat completion format
- **Tool Calling Support**: Поддержка функций и инструментов
- **Cost Optimization**: Значительное снижение затрат на AI
- **Production Ready**: Готовность к production использованию

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Model**: OpenAI gpt-oss-120b via HuggingFace
- **SDK**: @huggingface/inference

## Структура проекта

```
src/
├── logic/
│   ├── agent/         # Triage агент для pharma sales
│   ├── completion/    # HuggingFace completion provider
│   ├── enum/          # Перечисления
│   ├── swarm/         # Root swarm конфигурация
│   └── tools/         # Add to cart инструмент
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
HF_API_KEY=your_huggingface_api_key
```

## Примеры использования

1. **Pharma консультация**: "Посоветуйте лекарство от головной боли"
2. **Добавление в корзину**: "Добавьте аспирин в корзину"
3. **Общие вопросы**: "Какие у вас есть витамины?"
4. **Product search**: "Что поможет от простуды?"

## Экономические преимущества

- **Драматическое снижение costs**: $15/месяц vs $100/месяц
- **Сохранение качества**: OpenAI-level модель качества
- **No vendor lock-in**: Легкий переход между провайдерами
- **Scalable pricing**: Плати только за использование

## Сравнение провайдеров

| Провайдер | Модель | Цена/месяц | Качество |
|-----------|--------|------------|----------|
| xAI | grok-3-mini | ~$100 | Высокое |
| HuggingFace | gpt-oss-120b | ~$15 | Сопоставимое |
| **Экономия** | | **85%** | **Без потерь** |

## Применение

Идеально для:
- Startups с ограниченным бюджетом
- MVP и prototype разработки
- Cost-sensitive production систем
- Эксперименты с AI без больших затрат

## Migration Guide

Для перехода с OpenAI/xAI:
1. Замените completion provider на HfCompletion
2. Обновите API ключи в environment
3. Никаких изменений в agent логике не требуется