# RoundRobin

A generic RoundRobin implementation that distributes calls across a set of tokens
using a factory function to create instances.

## Constructor

```ts
constructor();
```

## Properties

### tokens

```ts
tokens: any
```

### factory

```ts
factory: any
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

Gets the next instance in the rotation, creating it if necessary

## Methods

### create

```ts
static create<T, Token = string | symbol | {
    [key: string]: any;
}, A extends any[] = any[]>(tokens: Token[], factory: (token: Token, ...args: A) => T): (...args: A) => T;
```

Creates a RoundRobin function that cycles through tokens
