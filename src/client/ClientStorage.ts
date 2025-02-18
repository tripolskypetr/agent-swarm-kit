import { execpool, memoize, singleshot, SortedArray } from "functools-kit";
import {
  IStorage,
  IStorageData,
  IStorageParams,
} from "../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../config/params";

export class ClientStorage<T extends IStorageData = IStorageData>
  implements IStorage<T>
{
  private _itemMap = new Map<IStorageData["id"], T>();

  constructor(readonly params: IStorageParams<T>) {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
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
      if (this.params.onCreate) {
        this.params.onCreate(
          index,
          embeddings,
          this.params.clientId,
          this.params.embedding
        );
      }
      return [embeddings, index] as const;
    }
  );

  waitForInit = singleshot(async () => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} waitForInit`
    );
    if (!this.params.getData) {
        return;
    }
    const data = await this.params.getData(
      this.params.clientId,
      this.params.storageName
    );
    await Promise.all(
      data.map(
        execpool(this._createEmbedding, {
          delay: 10,
          maxExec: GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL,
        })
      )
    );
    this._itemMap = new Map(data.map((item) => [item.id, item]));
  });

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
    if (this.params.onCreate) {
      this.params.onCreate(
        search,
        searchEmbeddings,
        this.params.clientId,
        this.params.embedding
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
            if (this.params.onCompare) {
              this.params.onCompare(
                search,
                index,
                score,
                this.params.clientId,
                this.params.embedding
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
    this.params.logger.debug(`ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} take indexed`,{
        indexed: indexed.getEntries(),
    })
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
        item,
      }
    );
    this._itemMap.set(item.id, item);
    this._createEmbedding.clear(item.id);
    await this._createEmbedding(item);
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks?.onUpdate(
        [...this._itemMap.values()],
        this.params.clientId,
        this.params.storageName
      );
    }
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
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks?.onUpdate(
        [...this._itemMap.values()],
        this.params.clientId,
        this.params.storageName
      );
    }
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

  list = async (filter?: (item: T) => boolean) => {
    this.params.logger.debug(
      `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} list`
    );
    if (!filter) {
      return [...this._itemMap.values()];
    }
    const result: T[] = [];
    for (const item of this._itemMap.values()) {
      if (filter(item)) {
        result.push(item);
      }
    }
    return result;
  };
}

export default ClientStorage;
