---
title: example/15_web_server_and_error_handling
group: example
---

# Web Server and Error Handling

This document covers the HTTP web server implementation using the Hono framework and the comprehensive error handling mechanisms that ensure system reliability. The web server serves as the primary backend API endpoint and handles all HTTP requests from the frontend applications.

For information about specific API endpoints and routes, see [API Endpoints](./17_API_Endpoints.md). For details about external service integrations that the web server facilitates, see [External Service Integrations](./16_External_Service_Integrations.md).

## Web Server Architecture

The system uses the Hono web framework to provide a lightweight, fast HTTP server that handles all backend API requests. The server runs on port 30050 and integrates with the IoC container for dependency injection.

### Hono Server Configuration

![Mermaid Diagram](./diagrams\15_Web_Server_and_Error_Handling_0.svg)

The main server entry point is configured in `src/main/hono.ts`, where the `serve()` function from `@hono/node-server` creates an HTTP server instance. The server only starts if the system is not running in REPL mode, as determined by `ioc.bootstrapService.isRepl`.

## Request Processing Pipeline

The Hono application processes incoming requests through a series of registered routes, each handling specific API endpoints for different system functions.

### Route Organization

| Route Module | Purpose | Endpoints |
|-------------|---------|-----------|
| `health` | System health checks | Health monitoring |
| `session` | WebSocket session management | Agent conversations |
| `status` | System status reporting | Service status |
| `openai` | AI agent communication | LLM interactions |
| `info` | System information | Configuration data |
| `price` | Market data | Cryptocurrency prices |
| `wallet` | Trading operations | Order management |
| `report` | Report generation | Trading reports |

![Mermaid Diagram](./diagrams\15_Web_Server_and_Error_Handling_1.svg)

The server integrates with the IoC container through the imported `ioc` object from `../lib`, enabling dependency injection for all route handlers and business logic services.

## Error Handling System

The system implements comprehensive error handling through the `ErrorService` class, which provides global exception handling, error logging, and graceful shutdown capabilities.

### Global Error Handler Architecture

![Mermaid Diagram](./diagrams\15_Web_Server_and_Error_Handling_2.svg)

The `ErrorService` uses a singleton pattern with global symbols to ensure error handlers are only installed once. It provides a `beforeExitSubject` that allows other services to register cleanup handlers before the process terminates.

### Error Handling Features

The error handling system includes several key capabilities:

- **Global Exception Capture**: Catches all uncaught exceptions and unhandled promise rejections
- **Structured Error Logging**: Uses `errorData()` from `functools-kit` to serialize error information
- **File System Logging**: Appends error details to `./error.txt` for persistence
- **Graceful Shutdown**: Provides a notification system for cleanup before process termination
- **REPL Safety**: Disables error handling in REPL mode to avoid interfering with development

## Frontend Integration

The web server is designed to work seamlessly with multiple frontend applications through Vite's development proxy configuration.

### Development Proxy Configuration

![Mermaid Diagram](./diagrams\15_Web_Server_and_Error_Handling_3.svg)

The frontend applications use Vite's proxy configuration to forward API requests to the Hono server. This is configured in each app's `vite.config.mts` with proxy rules targeting `http://localhost:30050`.

## WebSocket Support

The server includes WebSocket support for real-time communication, primarily used for agent conversation sessions and live data updates.

### WebSocket Integration

The WebSocket functionality is injected into the HTTP server instance after creation through the `injectWebSocket()` function imported from the app configuration. This enables bidirectional communication for:

- Agent conversation sessions
- Real-time trading signal updates  
- Live market data streaming
- System status notifications

The WebSocket connections are managed through the session routing system, allowing multiple concurrent agent conversations and data streams.
