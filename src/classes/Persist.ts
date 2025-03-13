import { randomBytes } from "crypto";
import fs from "fs/promises";
import { getErrorMessage, memoize, queued, singleshot } from "functools-kit";
import { join } from "path";
import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StateName } from "../interfaces/State.interface";
import { IStorageData, StorageName } from "src/interfaces/Storage.interface";
import { IModelMessage } from "src/model/ModelMessage.model";

type EntityId = string | number;

interface IEntity {}

const BASE_WAIT_FOR_INIT_SYMBOL = Symbol("wait-for-init");

export class PersistBase<EntityName extends string = string> {
  private directory: string;

  constructor(
    private readonly entityName: EntityName,
    private readonly baseDir = join(process.cwd(), "logs/data")
  ) {
    this.directory = join(this.baseDir, this.entityName);
  }

  private getFilePath(entityId: EntityId) {
    return join(this.baseDir, this.entityName, `${entityId}.json`);
  }

  private [BASE_WAIT_FOR_INIT_SYMBOL] = singleshot(async () => {
    await fs.mkdir(this.directory, { recursive: true });
  });

  public async waitForInit(initial: boolean) {
    await this[BASE_WAIT_FOR_INIT_SYMBOL]();
  }

  public async getCount(): Promise<number> {
    const files = await fs.readdir(this.directory);
    const { length } = files.filter((file) => file.endsWith(".json"));
    return length;
  }

  public async readValue<T extends IEntity = IEntity>(
    entityId: EntityId
  ): Promise<T> {
    try {
      const filePath = this.getFilePath(entityId);
      const fileContent = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as T;
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error(`Entity ${this.entityName}:${entityId} not found`);
      }
      throw new Error(
        `Failed to read entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  public async hasValue(entityId: EntityId): Promise<boolean> {
    try {
      const filePath = this.getFilePath(entityId);
      await fs.access(filePath);
      return true;
    } catch (error) {
      if (error?.code === "ENOENT") {
        return false;
      }
      throw new Error(
        `Failed to check existence of entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  public writeValue = async <T extends IEntity = IEntity>(
    entityId: EntityId,
    entity: T
  ) => {
    try {
      const filePath = this.getFilePath(entityId);
      const serializedData = JSON.stringify(entity);
      await fs.writeFile(filePath, serializedData, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to write entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  public async removeValue(entityId: EntityId): Promise<void> {
    try {
      const filePath = this.getFilePath(entityId);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        throw new Error(
          `Entity ${this.entityName}:${entityId} not found for deletion`
        );
      }
      throw new Error(
        `Failed to remove entity ${this.entityName}:${entityId}: ${error.message}`
      );
    }
  }

  public async removeAll(): Promise<void> {
    try {
      const files = await fs.readdir(this.directory);
      const entityFiles = files.filter((file) => file.endsWith(".json"));
      for (const file of entityFiles) {
        await fs.unlink(file);
      }
    } catch (error) {
      throw new Error(
        `Failed to remove values for ${this.entityName}: ${getErrorMessage(
          error
        )}`
      );
    }
  }

  public async *values<T extends IEntity = IEntity>(): AsyncGenerator<T> {
    try {
      const files = await fs.readdir(this.directory);
      const entityIds = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -5))
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      for (const entityId of entityIds) {
        const entity = await this.readValue<T>(entityId);
        yield entity;
      }
    } catch (error) {
      throw new Error(
        `Failed to read values for ${this.entityName}: ${getErrorMessage(
          error
        )}`
      );
    }
  }

  public async *keys(): AsyncGenerator<EntityId> {
    try {
      const files = await fs.readdir(this.directory);
      const entityIds = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -5))
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      for (const entityId of entityIds) {
        yield entityId;
      }
    } catch (error) {
      throw new Error(
        `Failed to read keys for ${this.entityName}: ${getErrorMessage(error)}`
      );
    }
  }

  public async *[Symbol.asyncIterator](): AsyncIterableIterator<any> {
    for await (const entity of this.values()) {
      yield entity;
    }
  }

  public async *filter<T extends IEntity = IEntity>(
    predicate: (value: T) => boolean
  ) {
    for await (const entity of this.values<T>()) {
      if (predicate(entity)) {
        yield entity;
      }
    }
  }

  public async *take<T extends IEntity = IEntity>(
    total: number,
    predicate?: (value: T) => boolean
  ) {
    let count = 0;
    if (predicate) {
      for await (const entity of this.values<T>()) {
        if (!predicate(entity)) {
          continue;
        }
        count += 1;
        yield entity;
        if (count >= total) {
          break;
        }
      }
    } else {
      for await (const entity of this.values<T>()) {
        count += 1;
        yield entity;
        if (count >= total) {
          break;
        }
      }
    }
  }
}

export class PersistList<
  EntityName extends string = string
> extends PersistBase<EntityName> {
  private lastCount: number | null = null;

  private createKey = queued(async () => {
    if (this.lastCount === null) {
      for await (const key of this.keys()) {
        this.lastCount = Math.max(Number(key), this.lastCount || 0);
      }
    }
    if (this.lastCount === null) {
      this.lastCount = 0;
    }
    return String((this.lastCount += 1));
  }) as () => Promise<string>;

  private async getLastKey() {
    let lastKey = 0;
    for await (const key of this.keys()) {
      lastKey = Math.max(Number(key), lastKey);
    }
    if (lastKey === 0) {
      return null;
    }
    return String(lastKey);
  }

  public async push<T extends IEntity = IEntity>(entity: T) {
    await this.writeValue(await this.createKey(), entity);
  }

  public pop = queued(async () => {
    const lastKey = await this.getLastKey();
    if (lastKey === null) {
      return null;
    }
    const value = await this.readValue(lastKey);
    await this.removeValue(lastKey);
    return value;
  }) as <T extends IEntity = IEntity>() => Promise<T | null>;
}

class PersistSwarmUtils {
  private getActiveAgentStorage = memoize(
    ([swarmName]) => `${swarmName}`,
    (swarmName: SwarmName) =>
      new PersistBase(swarmName, `./logs/data/_swarm_active_agent/`)
  );

  private getNavigationStackStorage = memoize(
    ([swarmName]) => `${swarmName}`,
    (swarmName: SwarmName) =>
      new PersistBase(swarmName, `./logs/data/_swarm_navigation_stack/`)
  );

  public getActiveAgent = async (
    clientId: string,
    swarmName: SwarmName,
    defaultAgent: AgentName
  ) => {
    const isInitial = this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    if (await activeAgentStorage.hasValue(clientId)) {
      const { agentName } = await activeAgentStorage.readValue<{
        agentName: AgentName;
      }>(clientId);
      return agentName;
    }
    return defaultAgent;
  };

  public setActiveAgent = async (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ) => {
    const isInitial = this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    await activeAgentStorage.writeValue(clientId, { agentName });
  };

  public getNavigationStack = async (
    clientId: string,
    swarmName: SwarmName
  ) => {
    const isInitial = this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    if (await navigationStackStorage.hasValue(clientId)) {
      const { agentStack } = await navigationStackStorage.readValue<{
        agentStack: AgentName[];
      }>(clientId);
      return agentStack;
    }
    return [];
  };

  public setNavigationStack = async (
    clientId: string,
    agentStack: AgentName[],
    swarmName: SwarmName
  ) => {
    const isInitial = this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    await navigationStackStorage.writeValue<{
      agentStack: AgentName[];
    }>(clientId, { agentStack });
  };
}

export const PersistSwarm = new PersistSwarmUtils();

class PersistStateUtils {
  private getStateStorage = memoize(
    ([stateName]) => `${stateName}`,
    (stateName: StateName) => new PersistBase(stateName, `./logs/data/state/`)
  );

  public setState = async <T = unknown>(
    state: T,
    clientId: string,
    stateName: StateName
  ) => {
    const isInitial = this.getStateStorage.has(stateName);
    const stateStorage = this.getStateStorage(stateName);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { state });
  };

  public getState = async <T = unknown>(
    clientId: string,
    stateName: StateName,
    defaultState: T
  ) => {
    const isInitial = this.getStateStorage.has(stateName);
    const stateStorage = this.getStateStorage(stateName);
    await stateStorage.waitForInit(isInitial);
    if (await stateStorage.hasValue(clientId)) {
      const { state } = await stateStorage.readValue<{ state: T }>(clientId);
      return state;
    }
    return defaultState;
  };
}

export const PersistState = new PersistStateUtils();

class PersistStorageUtils {
  private getPersistStorage = memoize(
    ([storageName]) => `${storageName}`,
    (storageName: StorageName) =>
      new PersistBase(storageName, `./logs/data/storage/`)
  );

  public getData = async <T extends IStorageData = IStorageData>(
    clientId: string,
    storageName: StorageName,
    defaultValue: T[]
  ) => {
    const isInitial = this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    if (await persistStorage.hasValue(clientId)) {
      const { data } = await persistStorage.readValue<{ data: T[] }>(clientId);
      return data;
    }
    return defaultValue;
  };

  public setData = async <T extends IStorageData = IStorageData>(
    data: T[],
    clientId: string,
    storageName: StorageName
  ) => {
    const isInitial = this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    await persistStorage.writeValue(clientId, { data });
  };
}

export const PersistStorage = new PersistStorageUtils();

class PersistHistoryUtils {

  private getHistoryStorage = memoize(
    ([clientId]) => `${clientId}`,
    (clientId: string) =>
      new PersistList(clientId, `./logs/data/history`)
  );

  public async waitForInit(
    clientId: string,
  ): Promise<void> {
    const isInitial = this.getHistoryStorage.has(clientId);
    const historyStorage = this.getHistoryStorage(clientId);
    await historyStorage.waitForInit(isInitial);
  }

  public async *iterate(
    clientId: string,
  ): AsyncIterableIterator<IModelMessage> {
    const isInitial = this.getHistoryStorage.has(clientId);
    const historyStorage = this.getHistoryStorage(clientId);
    await historyStorage.waitForInit(isInitial);
    for await (const message of historyStorage.values<IModelMessage>()) {
      yield message;
    }
  }

  public async push(clientId: string, value: IModelMessage) {
    const isInitial = this.getHistoryStorage.has(clientId);
    const historyStorage = this.getHistoryStorage(clientId);
    await historyStorage.waitForInit(isInitial);
    await historyStorage.push(value);
  }

  public async pop(clientId: string) {
    const isInitial = this.getHistoryStorage.has(clientId);
    const historyStorage = this.getHistoryStorage(clientId);
    await historyStorage.waitForInit(isInitial);
    await historyStorage.pop();
  }

  public dispose(clientId: string) {
    this.getHistoryStorage.clear(clientId);
  }
}

export const PersistHistory = new PersistHistoryUtils();
