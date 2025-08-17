---
title: demo/firebase-support-chat/readme
group: demo/firebase-support-chat
---

# Firebase Support Chat

Customer support system with Firebase real-time database for message persistence.

## Purpose

Demonstrates capabilities:
- Firebase integration for real-time persistence
- Creating professional support systems
- Processing customer queries through agents
- Scalable architecture for support teams

## Key Features

- **Firebase Integration**: Real-time database for messages
- **Support Agent**: Specialized operator agent
- **Message Persistence**: Automatic history saving
- **Real-time Updates**: Instant synchronization between clients
- **Scalable Architecture**: Ready for scaling

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Database**: Firebase Realtime Database
- **AI Providers**: OpenAI, Ollama

## Project Structure

```
src/
├── config/
│   └── firebase.ts    # Firebase configuration
├── utils/
│   ├── saveMessage.ts # Message saving
│   └── watchMessages.ts # Change monitoring
├── repl.ts           # REPL interface
└── lib/
    └── swarm.ts      # Swarm configuration
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Firebase Setup
# 1. Create project in Firebase Console
# 2. Enable Realtime Database
# 3. Get configuration

# Run
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

## Usage Examples

1. **Support Requests**: "I have a payment issue"
2. **Technical Support**: "Feature X is not working"
3. **General Questions**: "How to use the product?"
4. **Escalation**: Transferring complex issues to operator

## Firebase Advantages

- **Real-time Synchronization**: Instant updates
- **Auto-scaling**: Google-managed infrastructure
- **Offline Support**: Works without internet connection
- **Security Rules**: Flexible access configuration

## Applications

Perfect for:
- Customer support centers
- Help desk systems
- SaaS technical support
- E-commerce support
- Educational platforms

## Extension

Can be expanded with:
- Ticketing system
- Request prioritization
- Analytics and reporting
- Multi-language support