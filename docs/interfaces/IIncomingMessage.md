---
title: docs/api-reference/interface/IIncomingMessage
group: docs
---

# IIncomingMessage

Interface representing an incoming message received by the swarm system.
Encapsulates a message entering the system, typically from a client (e.g., user input), processed by agents (e.g., ClientAgent.execute) or sessions (e.g., ISession.connect).
Used to convey data from an external source to an agent, potentially triggering actions like history updates (e.g., IHistory.push) or event emissions (e.g., IBus.emit "commit-user-message").

## Properties

### clientId

```ts
clientId: string
```

The unique identifier of the client sending the message.
Identifies the originating client session, matching clientId in runtime params (e.g., this.params.clientId in ClientAgent), ensuring the message is tied to a specific sender.
Example: "client-123" for a user session submitting a command.

### data

```ts
data: string
```

The content or payload of the incoming message.
Contains the raw data sent by the client, typically a string (e.g., user command, query), processed as input by agents (e.g., incoming in ClientAgent.execute).
Example: "What is the weather?" for a user query received by an agent.

### agentName

```ts
agentName: string
```

The name of the agent designated to receive or process the message.
Links the message to a specific agent instance (e.g., this.params.agentName in ClientAgent), aligning with AgentName from IAgentParams for routing or context.
Example: "WeatherAgent" for an agent handling weather-related queries.
