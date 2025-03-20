import {
  PersistAlive,
  PersistMemory,
  PersistPolicy,
  PersistState,
  PersistStorage,
  PersistSwarm,
  PersistEmbedding,
  History,
  type IHistoryInstance,
  type IModelMessage,
  type IPersistBase,
  type IPersistActiveAgentData,
  type IPersistNavigationStackData,
  type IPersistStateData,
  type IPersistStorageData,
  type IPersistMemoryData,
  type IPersistPolicyData,
  type IPersistAliveData,
  type IPersistEmbeddingData,
  setConfig,
} from "agent-swarm-kit";
import { singleshot } from "functools-kit";
import Redis from "ioredis";

setConfig({
  CC_PERSIST_EMBEDDING_CACHE: true,
});

declare function parseInt(s: unknown): number;

const HISTORY_REDIS_TTL = 86400; // 24 hours
const ALIVE_REDIS_TTL = 3600; // 1 hour

const getRedis = singleshot(
  () =>
    new Promise<Redis>((res) => {
      const redis = new Redis({
        host: process.env.CC_REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.CC_REDIS_PORT) || 6379,
        password: process.env.CC_REDIS_PASSWORD || "",
      });
      redis.on("connect", () => {
        res(redis);
      });
      redis.on("error", (error) => {
        throw error;
      });
      redis.on("close", () => {
        throw new Error("redis connection closed");
      });
      return redis;
    })
);

History.useHistoryAdapter(
  class implements IHistoryInstance {
    private _redis: Redis = null as never;
    private _messages: IModelMessage[] = [];

    async *iterate(): AsyncIterableIterator<IModelMessage> {
      for await (const message of this._messages) {
        yield message;
      }
    }

    constructor(public readonly clientId: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
      const messages = await this._redis.lrange(
        `history:${this.clientId}:messages`,
        0,
        -1
      );
      this._messages = messages.map((msg) => JSON.parse(msg) as IModelMessage);
    });

    async push(value: IModelMessage): Promise<void> {
      const key = `history:${this.clientId}:messages`;
      await this._redis.rpush(key, JSON.stringify(value));
      await this._redis.expire(key, HISTORY_REDIS_TTL);
      this._messages.push(value);
    }

    async pop(): Promise<IModelMessage | null> {
      const key = `history:${this.clientId}:messages`;
      await this._redis.lpop(key);
      return this._messages.pop() ?? null;
    }

    async dispose() {
      this._messages = [];
    }
  }
);

PersistSwarm.usePersistActiveAgentAdapter(
  class implements IPersistBase<IPersistActiveAgentData> {
    private _redis: Redis = null as never;

    constructor(private readonly swarmName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(clientId: string): Promise<IPersistActiveAgentData> {
      const key = `swarm:${this.swarmName}:active_agent:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistActiveAgent ${clientId} not found.`);
      }
      return JSON.parse(value) as IPersistActiveAgentData;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `swarm:${this.swarmName}:active_agent:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistActiveAgentData
    ): Promise<void> {
      const key = `swarm:${this.swarmName}:active_agent:${clientId}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistSwarm.usePersistNavigationStackAdapter(
  class implements IPersistBase<IPersistNavigationStackData> {
    private _redis: Redis = null as never;

    constructor(private readonly swarmName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(clientId: string): Promise<IPersistNavigationStackData> {
      const key = `swarm:${this.swarmName}:navigation_stack:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistNavigationStack ${clientId} not found.`);
      }
      return JSON.parse(value) as IPersistNavigationStackData;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `swarm:${this.swarmName}:navigation_stack:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistNavigationStackData
    ): Promise<void> {
      const key = `swarm:${this.swarmName}:navigation_stack:${clientId}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistState.usePersistStateAdapter(
  class implements IPersistBase<IPersistStateData> {
    private _redis: Redis = null as never;

    constructor(private readonly stateName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(clientId: string): Promise<IPersistStateData<unknown>> {
      const key = `state:${this.stateName}:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistState ${clientId} not found.`);
      }
      return JSON.parse(value) as IPersistStateData<unknown>;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `state:${this.stateName}:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistStateData<unknown>
    ): Promise<void> {
      const key = `state:${this.stateName}:${clientId}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistStorage.usePersistStorageAdapter(
  class implements IPersistBase<IPersistStorageData> {
    private _redis: Redis = null as never;

    constructor(private readonly storageName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(clientId: string): Promise<IPersistStorageData> {
      const key = `storage:${this.storageName}:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistStorage ${clientId} not found.`);
      }
      return JSON.parse(value) as IPersistStorageData;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `storage:${this.storageName}:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistStorageData
    ): Promise<void> {
      const key = `storage:${this.storageName}:${clientId}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistMemory.usePersistMemoryAdapter(
  class implements IPersistBase<IPersistMemoryData> {
    private _redis: Redis = null as never;

    constructor(private readonly memoryName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(clientId: string): Promise<IPersistMemoryData<unknown>> {
      const key = `memory:${this.memoryName}:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistMemory ${clientId} not found.`);
      }
      return JSON.parse(value) as IPersistMemoryData<unknown>;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `memory:${this.memoryName}:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistMemoryData<unknown>
    ): Promise<void> {
      const key = `memory:${this.memoryName}:${clientId}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistPolicy.usePersistPolicyAdapter(
  class implements IPersistBase<IPersistPolicyData> {
    private _redis: Redis = null as never;

    constructor(private readonly swarmName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(policyName: string): Promise<IPersistPolicyData> {
      const key = `policy:${this.swarmName}:${policyName}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistPolicy ${policyName} not found.`);
      }
      return JSON.parse(value) as IPersistPolicyData;
    }

    async hasValue(policyName: string): Promise<boolean> {
      const key = `policy:${this.swarmName}:${policyName}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      policyName: string,
      entity: IPersistPolicyData
    ): Promise<void> {
      const key = `policy:${this.swarmName}:${policyName}`;
      await this._redis.set(key, JSON.stringify(entity));
    }
  }
);

PersistAlive.usePersistAliveAdapter(
  class implements IPersistBase<IPersistAliveData> {
    private _redis: Redis = null as never;

    constructor(private readonly swarmName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
      const pattern = `alive:${this.swarmName}:*`;
      const keys = await this._redis.keys(pattern);
      if (keys.length > 0) {
        await this._redis.del(...keys);
      }
    });

    async readValue(clientId: string): Promise<IPersistAliveData> {
      const key = `alive:${this.swarmName}:${clientId}`;
      const value = await this._redis.get(key);
      if (!value) {
        return { online: false };
      }
      return JSON.parse(value) as IPersistAliveData;
    }

    async hasValue(clientId: string): Promise<boolean> {
      const key = `alive:${this.swarmName}:${clientId}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      clientId: string,
      entity: IPersistAliveData
    ): Promise<void> {
      const key = `alive:${this.swarmName}:${clientId}`;
      if (!entity.online) {
        await this._redis.del(key);
        return;
      }
      await this._redis.set(key, JSON.stringify(entity));
      await this._redis.expire(key, ALIVE_REDIS_TTL);
    }
  }
);

PersistEmbedding.usePersistEmbeddingAdapter(
  class implements IPersistBase<IPersistEmbeddingData> {
    private _redis: Redis = null as never;

    constructor(private readonly embeddingName: string) {}

    public waitForInit = singleshot(async () => {
      this._redis = await getRedis();
    });

    async readValue(stringHash: string): Promise<IPersistEmbeddingData> {
      const key = `embedding:${this.embeddingName}:${stringHash}`;
      const value = await this._redis.get(key);
      if (!value) {
        throw new Error(`PersistEmbedding ${stringHash} not found.`);
      }
      const buffer = Buffer.from(value, "base64");
      const embeddings = Array.from(new Float64Array(buffer.buffer));
      return { embeddings };
    }

    async hasValue(stringHash: string): Promise<boolean> {
      const key = `embedding:${this.embeddingName}:${stringHash}`;
      const exists = await this._redis.exists(key);
      return exists === 1;
    }

    async writeValue(
      stringHash: string,
      entity: IPersistEmbeddingData
    ): Promise<void> {
      const key = `embedding:${this.embeddingName}:${stringHash}`;
      const buffer = Buffer.from(new Float64Array(entity.embeddings).buffer);
      await this._redis.set(key, buffer.toString("base64"));
    }
  }
);
