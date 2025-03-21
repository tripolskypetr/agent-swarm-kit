# RoundRobin

A generic RoundRobin implementation that cycles through token-based instance creators.

## Constructor

```ts
constructor();
```

## Properties

### tokens

```ts
tokens: Token[]
```

### instances

```ts
instances: any
```

### currentIndex

```ts
currentIndex: any
```

### call

```ts
call: any
```

Cycles through the tokens and invokes the corresponding instance creator with the provided arguments.
Logs the current index and token count if logging is enabled.

## Methods

### create

```ts
static create<T, Token = string | symbol | {
    [key: string]: any;
}, A extends any[] = any[]>(tokens: Token[], factory: (token: Token) => (...args: A) => T): (...args: A) => T;
```

Creates a RoundRobin function that cycles through tokens
