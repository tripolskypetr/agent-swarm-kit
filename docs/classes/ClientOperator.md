---
title: docs/api-reference/class/ClientOperator
group: docs
---

# ClientOperator

Implements `IAgent`

Client operator implementation

## Constructor

```ts
constructor(params: IOperatorParams);
```

## Properties

### params

```ts
params: IOperatorParams
```

### _outgoingSubject

```ts
_outgoingSubject: any
```

### _operatorSignal

```ts
_operatorSignal: any
```

## Methods

### run

```ts
run(): Promise<string>;
```

Runs the operator (not supported)

### execute

```ts
execute(input: string, mode: ExecutionMode): Promise<void>;
```

Executes an input with specified mode

### waitForOutput

```ts
waitForOutput(): Promise<string>;
```

Waits for operator output with timeout

### commitToolOutput

```ts
commitToolOutput(): Promise<void>;
```

Commits tool output (not supported)

### commitSystemMessage

```ts
commitSystemMessage(): Promise<void>;
```

Commits system message (not supported)

### commitToolRequest

```ts
commitToolRequest(): Promise<string[]>;
```

Commits tool request (not supported)

### commitUserMessage

```ts
commitUserMessage(content: string): Promise<void>;
```

Commits user message

### commitAssistantMessage

```ts
commitAssistantMessage(): Promise<void>;
```

Commits assistant message (not supported)

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits flush (not supported)

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Commits stop tools (not supported)

### commitCancelOutput

```ts
commitCancelOutput(): Promise<void>;
```

Commits stop tools (not supported)

### commitAgentChange

```ts
commitAgentChange(): Promise<void>;
```

Commits agent change

### dispose

```ts
dispose(): Promise<void>;
```

Disposes the client operator
