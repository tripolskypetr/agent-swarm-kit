# Payload

```ts
type Payload<T extends IStorageData = IStorageData> = {
    itemId: IStorageData["id"];
    item: T;
};
```


