---
title: demo/testbed-chat/readme
group: demo/testbed-chat
---

# Testbed Chat

Тестовая среда для agent-swarm-kit с build pipeline, testing framework и Rollup bundling.

## Назначение

Демонстрирует возможности:
- Comprehensive testing setup для agent-swarm проектов
- Build pipeline с Rollup bundler
- Test-driven development workflow
- Production build процесса

## Ключевые возможности

- **Testing Framework**: Comprehensive test suite
- **Rollup Bundling**: Оптимизированная сборка для production
- **Sales Agent Testing**: Тестирование business logic
- **Build Pipeline**: Автоматизированная сборка
- **Development Workflow**: Hot reload и dev tools

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Bundler**: Rollup
- **Testing**: Custom test framework
- **AI Provider**: OpenAI

## Структура проекта

```
├── build/                # Build output
├── scripts/
│   ├── docs.mjs         # Documentation generator
│   └── repl.mjs         # REPL script
├── src/
│   ├── config/
│   │   ├── openai.ts    # OpenAI configuration
│   │   └── setup.ts     # System setup
│   ├── logic/
│   │   ├── agent/       # Sales агент
│   │   ├── completion/  # OpenAI completion
│   │   ├── enum/        # Type definitions
│   │   ├── swarm/       # Root swarm
│   │   └── tools/       # Add to basket tool
│   └── index.ts         # Entry point
├── test/
│   ├── config/
│   │   └── setup.mjs    # Test setup
│   ├── spec/
│   │   └── add_to_basket.spec.mjs # Test specs
│   └── index.mjs        # Test runner
├── rollup.config.mjs    # Rollup configuration
└── tsconfig.json        # TypeScript config
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск тестов
bun run test

# Development режим
bun run dev

# Production build
bun run build

# REPL для тестирования
bun run scripts/repl.mjs
```

## Конфигурация

Создайте файл `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

## Testing Framework

### Test Structure
```javascript
// test/spec/add_to_basket.spec.mjs
export default async function testAddToBasket() {
  const result = await addToBasket({
    params: { title: "Test Product" }
  });
  
  assert(result.success === true);
  assert(result.message.includes("added successfully"));
}
```

### Running Tests
```bash
# Все тесты
bun run test

# Конкретный тест
bun run test test/spec/add_to_basket.spec.mjs

# С подробным выводом
bun run test --verbose
```

## Build Pipeline

### Development Build
```bash
# Hot reload
bun run dev
```

### Production Build
```bash
# Optimized bundle
bun run build

# Output в build/ директории
ls build/
```

### Rollup Configuration
```javascript
// rollup.config.mjs
export default {
  input: 'src/index.ts',
  output: {
    dir: 'build',
    format: 'es'
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs()
  ]
};
```

## Testing Best Practices

### Unit Tests
- Тестирование отдельных функций
- Mock external dependencies
- Fast execution

### Integration Tests
- Тестирование agent interactions
- End-to-end workflows
- Real API calls в test environment

### Performance Tests
- Response time measurements
- Memory usage monitoring
- Load testing

## Development Workflow

1. **Write Tests**: TDD approach
2. **Implement Features**: Code against tests
3. **Run Tests**: Continuous validation
4. **Build**: Production optimization
5. **Deploy**: Automated pipeline

## Применение

Идеально для:
- Agent-swarm project templates
- CI/CD pipeline setup
- Testing framework демонстрации
- Development best practices
- Production deployment preparation

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: bun install
      - run: bun run test
      - run: bun run build
```