---
title: demo/testbed-chat/readme
group: demo/testbed-chat
---

# Testbed Chat

Test environment for agent-swarm-kit with build pipeline, testing framework and Rollup bundling.

## Purpose

Demonstrates capabilities:
- Comprehensive testing setup for agent-swarm projects
- Build pipeline with Rollup bundler
- Test-driven development workflow
- Production build process

## Key Features

- **Testing Framework**: Comprehensive test suite
- **Rollup Bundling**: Optimized build for production
- **Sales Agent Testing**: Business logic testing
- **Build Pipeline**: Automated build
- **Development Workflow**: Hot reload and dev tools

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Bundler**: Rollup
- **Testing**: Custom test framework
- **AI Provider**: OpenAI

## Project Structure

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
│   │   ├── agent/       # Sales agent
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

## Installation and Setup

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Development mode
bun run dev

# Production build
bun run build

# REPL for testing
bun run scripts/repl.mjs
```

## Configuration

Create a `.env` file:

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
# All tests
bun run test

# Specific test
bun run test test/spec/add_to_basket.spec.mjs

# With verbose output
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

# Output in build/ directory
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
- Testing individual functions
- Mock external dependencies
- Fast execution

### Integration Tests
- Testing agent interactions
- End-to-end workflows
- Real API calls in test environment

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

## Use Cases

Ideal for:
- Agent-swarm project templates
- CI/CD pipeline setup
- Testing framework demonstration
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