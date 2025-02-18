import { execpool, memoize, SortedArray } from "functools-kit";
import {
  IStorage,
  IStorageData,
  IStorageParams,
} from "../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../config/params";

export class ClientStorage<T extends IStorageData = IStorageData>
  implements IStorage<T>
{
  readonly _itemMap = new Map(this.params.data.map((item) => [item.id, item]));

  constructor(readonly params: IStorageParams<T>) {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
    params.data.forEach(this._createEmbedding);
  }

  _createEmbedding = memoize(
    ([{ id }]) => id,
    async (item: T) => {
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} _createEmbedding`,
        {
          id: item.id,
        }
      );
      const index = await this.params.createIndex(item);
      const embeddings = await this.params.createEmbedding(index);
      if (this.params.callbacks?.onCreate) {
        this.params.callbacks.onCreate(index, embeddings, this.params.clientId);
      }
      return [embeddings, index] as const;
    }
  );

  take = async (search: string, total: number): Promise<T[]> => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} take`,
      {
        search,
        total,
      }
    );
    const indexed = new SortedArray<IStorageData>();
    const searchEmbeddings = await this.params.createEmbedding(search);
    if (this.params.callbacks?.onCreate) {
      this.params.callbacks.onCreate(
        search,
        searchEmbeddings,
        this.params.clientId
      );
    }
    await Promise.all(
      Array.from(this._itemMap.values()).map(
        execpool(
          async (item) => {
            const [targetEmbeddings, index] = await this._createEmbedding(item);
            const score = await this.params.calculateSimilarity(
              searchEmbeddings,
              targetEmbeddings
            );
            if (this.params.callbacks?.onCompare) {
              this.params.callbacks.onCompare(
                search,
                index,
                score,
                this.params.clientId
              );
            }
            indexed.push({ id: item.id }, score);
          },
          {
            delay: 10,
            maxExec: GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL,
          }
        )
      )
    );
    const filtered = indexed.take(
      total,
      GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY
    );
    return filtered.map(({ id }) => this._itemMap.get(id));
  };

  upsert = async (item: T) => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} upsert`,
      {
        id: item.id,
      }
    );
    this._itemMap.set(item.id, item);
    this._createEmbedding.clear(item.id);
    await this._createEmbedding(item);
  };

  remove = async (itemId: IStorageData["id"]) => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} remove`,
      {
        id: itemId,
      }
    );
    this._itemMap.delete(itemId);
    this._createEmbedding.clear(itemId);
  };

  clear = async () => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} clear`
    );
    this._itemMap.clear();
    this._createEmbedding.clear();
  };

  get = async (itemId: IStorageData["id"]): Promise<T | null> => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} get`,
      {
        id: itemId,
      }
    );
    return this._itemMap.get(itemId) ?? null;
  };

  list = async () => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} list`
    );
    return [...this._itemMap.values()];
  };
}

export default ClientStorage;
