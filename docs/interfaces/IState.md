# IState

State management interface.

## Properties

### getState

```ts
getState: () => Promise<T>
```

Gets the state.

### setState

```ts
setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>
```

Sets the state.

### clearState

```ts
clearState: () => Promise<T>
```

Set the state to initial value
