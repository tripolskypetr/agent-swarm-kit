---
title: example/18_frontend_applications
group: example
---

# Frontend Applications

This document provides an overview of the multiple React-based frontend applications that comprise the user interface layer of the signals trading platform. These applications serve different aspects of cryptocurrency trading, from order management to market analysis and AI agent conversations.

For detailed information about the backend API endpoints that these applications consume, see [API Endpoints](./17_API_Endpoints.md). For information about the AI agent system that powers the chat functionality, see [AI Agent Swarm System](./05_AI_Agent_Swarm_System.md).

## Individual Applications

### Chat Application
The chat application provides an interface for users to interact with the AI agent swarm system. It handles real-time conversations with cryptocurrency consultant agents through WebSocket connections.

**Key Features:**
- Real-time agent conversations
- WebSocket-based communication
- Agent routing and navigation
- Conversation history persistence

### Wallet Application  
The wallet application manages trading orders, tracks revenue, and provides order management functionality.

**Key Features:**
- Order creation and management
- Revenue tracking and visualization
- Portfolio balance monitoring
- Trade history and analytics

**Routing Structure:**
The wallet application uses a declarative routing system with the following main routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/main` | `MainView` | Primary dashboard |
| `/revenue/:symbol` | `RevenueView` | Symbol-specific revenue tracking |
| `/order_closed/:symbol` | `OrderCloseView` | Closed order details |
| `/error_page` | `ErrorView` | Error handling |

### News Application
The news application displays market reports, signal information, and aggregated market sentiment from various sources.

### Signal Application  
The signal application provides interfaces for viewing and managing trading signals, including signal history and performance metrics.

### Strategy Application
The strategy application offers financial planning tools and trading strategy calculators for portfolio optimization.

## Integration with Backend Services

All frontend applications integrate with the Hono web server running on port 30050, consuming REST API endpoints for data operations and WebSocket connections for real-time features:

**API Integration Patterns:**
- RESTful endpoints for CRUD operations
- WebSocket connections for real-time updates
- Centralized service layer through IoC container
- Consistent error handling and retry logic

**Service Dependencies:**
- Signal processing and validation services
- Order management and execution services  
- Market data and reporting services
- AI agent orchestration services

For detailed information about specific applications, see [Wallet Application](./19_Wallet_Application.md), [News Application](./20_News_Application.md), and [Strategy Application](./21_Strategy_Application.md).
