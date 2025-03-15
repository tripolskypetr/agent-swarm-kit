# Payload

```ts
type Payload<T extends IStorageData = IStorageData> = {
    itemId: IStorageData["id"];
    item: T;
};
```

Type representing the payload for storage actions.
