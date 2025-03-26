---
title: docs/api-reference/class/ClientSession
group: docs
---

# ClientSession

Implements `ISession`

Represents a client session in the swarm system, implementing the ISession interface.
Manages message execution, emission, and agent interactions for a client within a swarm, with policy enforcement via ClientPolicy
and event-driven communication via BusService. Uses a Subject for output emission to subscribers.
Integrates with SessionConnectionService (session instantiation), SwarmConnectionService (agent/swarm access via SwarmSchemaService),
ClientAgent (execution/history), ClientPolicy (validation), and BusService (event emission).

## Constructor

```ts
constructor(params: ISessionParams);
```

## Properties

### params

```ts
params: ISessionParams
```

## Methods

### emit

```ts
emit(message: string): Promise<void>;
```

Emits a message to subscribers via swarm _emitSubject after validating it against the policy (ClientPolicy).
Emits the ban message if validation fails, notifying subscribers and logging via BusService.
Supports SwarmConnectionService by broadcasting session outputs within the swarm.

### execute

```ts
execute(message: string, mode: ExecutionMode): Promise<string>;
```

Executes a message using the swarm's agent (ClientAgent) and returns the output after policy validation.
Validates input and output via ClientPolicy, returning a ban message if either fails, with event logging via BusService.
Coordinates with SwarmConnectionService to fetch the agent and wait for output, supporting session-level execution.

### run

```ts
run(message: string): Promise<string>;
```

Runs a stateless completion of a message using the swarm's agent (ClientAgent) and returns the output.
Does not emit the result but logs the execution via BusService, bypassing output validation for stateless use cases.
Integrates with SwarmConnectionService to access the agent, supporting lightweight completions.

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits tool output to the agent's history via the swarm’s agent (ClientAgent), logging the action via BusService.
Supports ToolSchemaService by linking tool output to tool calls, integrating with ClientAgent’s history management.

### commitUserMessage

```ts
commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;
```

Commits a user message to the agent’s history via the swarm’s agent (ClientAgent) without triggering a response.
Logs the action via BusService, supporting SessionConnectionService’s session history tracking.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits a flush of the agent’s history via the swarm’s agent (ClientAgent), clearing it and logging via BusService.
Useful for resetting session state, coordinated with ClientHistory via ClientAgent.

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Signals the agent (via swarm’s ClientAgent) to stop the execution of subsequent tools, logging via BusService.
Supports ToolSchemaService by interrupting tool call chains, enhancing session control.

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Commits a system message to the agent’s history via the swarm’s agent (ClientAgent), logging via BusService.
Supports system-level updates within the session, coordinated with ClientHistory.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Commits an assistant message to the agent’s history via the swarm’s agent (ClientAgent) without triggering execution.
Logs the action via BusService, supporting ClientHistory for assistant response logging.

### connect

```ts
connect(connector: SendMessageFn): ReceiveMessageFn<string>;
```

Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.
Links _emitSubject to the connector for outgoing messages and processes incoming messages via execute, supporting real-time interaction.
Integrates with SessionConnectionService for session lifecycle and SwarmConnectionService for agent metadata.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
Called when the session is no longer needed, ensuring proper resource release with SessionConnectionService.
