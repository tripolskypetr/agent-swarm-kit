---
title: articles/redis-llm-orchestration
group: articles
---
# Orchestrating LLM Model Chats via Redis

When working with language models, a common phenomenon is hallucinations—when the model provides incorrect conclusions. This is due to the limitations of the mathematical model, which introduces important nuances discussed in this article.

![Incorrect tool invocation protocol when attempting to run NVidia Nemotron Mini on Ollama](./images/bb8ef1cfb6bdc13dceb8d15392dc4e4c.png)
*Caption: Incorrect tool invocation protocol when attempting to run NVidia Nemotron Mini on Ollama*

In addition to hallucinations, there is currently no unified standard for tools: an XML template that the language model uses to interact with external integrations. In the image above, instead of a structured weather tool invocation, the model sent an unclear XML with the tag `<toolcall>` directly to the user.

## Key Insights

1. **You cannot trust a language model to pass an ID directly into tool arguments**  
   To generate diverse responses, language models use `seed` and `temperature`—the initial value of a pseudo-random number generator and a percentage determining how often the next token is chosen randomly. In other words, the model is mathematically inclined to pass you a random document ID.

2. **When filling out forms with more than one field, you cannot assume the model will populate the data from the conversation itself**  
   First, open-source datasets for training models do not include examples of filling out complex forms. Second, to avoid overflowing the context, message rotation is necessary. Third, if a model hallucination is detected (e.g., XML code in a user response), the only way to recover is to clear the conversation history.

3. **During message rotation, it’s critical to ensure the system prompt isn’t lost**  
   According to the OpenAI specification, a message in the conversation must have a `role` equivalent to one of the following: `"assistant"` (message from the language model), `"system"` (instructions for the model’s behavior), `"tool"` (tool invocation result), or `"user"` (message from the user). Deleting `"system"` messages during rotation will break the agent’s business logic, and `"tool"` messages with tool execution results should be removed alongside the corresponding `"assistant"` message request, and vice versa.

## Minimum Set of Primitives

To address the points mentioned above, the following primitives should be applied:

- **PersistStorage**  
  Instead of passing an element’s ID as a filter for every interaction with a list, you should use sorting to select the most suitable item based on a `similarity score` from its description via `vector search`.

- **PersistState**  
  Intermediate form-filling results need to be stored in a separate storage from the message history, as the latter must be reset if the model starts hallucinating.

- **PersistEmbedding**  
  Requests to compute [vector embeddings](https://platform.openai.com/docs/guides/embeddings) for list item descriptions are paid. Calculating the similarity score for strings in RAG works as follows: feature matrices are computed for the two strings being compared (once per string), then cosine similarity provides a match percentage from 0.0 to 1.0. To avoid redundant requests, computed vector values should be stored in a dictionary where the key is the hash of the original string.

### Additional Primitives

Beyond this, to make the chat functional, the following primitives are needed:

- **PersistAlive**  
  A flag indicating whether the language model’s interlocutor is online. This is critical for scheduling system maintenance.

- **PersistMemory**  
  Similar to the context of an HTTP request, an arbitrary key-value dictionary where, for example, the user’s locale can be stored.

- **PersistPolicy**  
  If someone asks, “Whose Crimea is it?” they should simply be banned—they’re not intending to pay. <s>I know for sure that ChatGPT is OpenAI, and I pay them for tokens.</s>

- **PersistSwarm**  
  When navigating a swarm of agents, the navigation stack must be preserved for `navigate back` functionality, and the current active agent must be saved to reload the system without state desynchronization.

## Code Example

The resulting structure will look like this:

![Another Redis Desktop Manager, same thing but without the flag](./images/3f2053dd4980ef16faa4fafd8fc4330e.png)
*Caption: Another Redis Desktop Manager, <s>same thing but without the flag</s>*

Here’s a segment of the source code for reference. You can explore [the full project here](https://github.com/tripolskypetr/agent-swarm-kit/blob/master/demo/redis-persist-chat/src/config/persist.ts). It’s a fully functional chat, and the technology works.

```typescript
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

const EMBEDDING_REDIS_TTL = 604800; // 1 week
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
      await this._redis.expire(key, EMBEDDING_REDIS_TTL);
    }
  }
);
```
