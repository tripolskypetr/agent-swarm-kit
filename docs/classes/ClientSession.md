# ClientSession

Implements `ISession`

## Constructor

```ts
constructor(params: ISessionParams);
```

## Properties

### params

```ts
params: ISessionParams
```

### execute

```ts
execute: (message: string) => Promise<string>
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

### connect

```ts
connect: (connector: SendMessageFn) => ReceiveMessageFn
```
