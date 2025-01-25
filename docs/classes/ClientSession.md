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

### _emitSubject

```ts
_emitSubject: Subject<string>
```

### execute

```ts
execute: (message: string, noEmit?: boolean) => Promise<string>
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
connect: (connector: SendMessageFn$1) => ReceiveMessageFn
```
