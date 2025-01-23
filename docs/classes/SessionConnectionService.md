# SessionConnectionService

Implements `ISession`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### contextService

```ts
contextService: any
```

### swarmConnectionService

```ts
swarmConnectionService: any
```

### getSession

```ts
getSession: ((clientId: string, swarmName: string) => ClientSession) & IClearableMemoize<string> & IControlMemoize<string, ClientSession>
```

### execute

```ts
execute: (content: string) => Promise<string>
```

### connect

```ts
connect: (connector: SendMessageFn) => ReceiveMessageFn
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

### dispose

```ts
dispose: () => Promise<void>
```
