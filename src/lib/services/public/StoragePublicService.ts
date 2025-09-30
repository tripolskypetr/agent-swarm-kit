import { inject } from "../../core/di";
import { StorageConnectionService } from "../connection/StorageConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStorageData, StorageName } from "../../../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending StorageConnectionService for type definition purposes.
 * Used to define TStorageConnectionService by excluding internal keys, ensuring StoragePublicService aligns with public-facing operations.
*/
interface IStorageConnectionService extends StorageConnectionService {}

/**
 * Type representing keys to exclude from IStorageConnectionService (internal methods).
 * Used to filter out non-public methods like getStorage and getSharedStorage in TStorageConnectionService.
*/
type InternalKeys = keyof {
  getStorage: never;
  getSharedStorage: never;
};

/**
 * Type representing the public interface of StoragePublicService, derived from IStorageConnectionService.
 * Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for client-specific storage operations.
*/
type TStorageConnectionService = {
  [key in Exclude<keyof IStorageConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public client-specific storage operations in the swarm system.
 * Implements TStorageConnectionService to provide a public API for storage interactions, delegating to StorageConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., storing/retrieving client-specific data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState per clientId), and DocService (e.g., documenting storage schemas via storageName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, clearing, and disposing client-specific storage.
 * Contrasts with SharedStoragePublicService (system-wide storage) by scoping storage to individual clients via clientId.
*/
export class StoragePublicService implements TStorageConnectionService {
  /**
   * Logger service instance, injected via DI, for logging storage operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StatePublicService and PerfService logging patterns.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Storage connection service instance, injected via DI, for underlying storage operations.
   * Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s client-specific storage needs.
   */
  private readonly storageConnectionService = inject<StorageConnectionService>(
    TYPES.storageConnectionService
  );

  /**
   * Retrieves a list of storage items based on a search query, total count, and optional score, from a client-specific storage identified by storageName and clientId.
   * Wraps StorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., searching client-specific storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data per client).
   */
  public take = async (
    search: string,
    total: number,
    methodName: string,
    clientId: string,
    storageName: StorageName,
    score?: number
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService take`, {
        methodName,
        search,
        total,
        clientId,
        storageName,
        score,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.take(search, total, score);
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Upserts (inserts or updates) an item in the client-specific storage identified by storageName and clientId.
   * Wraps StorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., storing client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState per client).
   */
  public upsert = async (
    item: IStorageData,
    methodName: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService upsert`, {
        item,
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.upsert(item);
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Removes an item from the client-specific storage identified by storageName and clientId, using the item’s ID.
   * Wraps StorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., deleting client-specific data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup per client).
   */
  public remove = async (
    itemId: IStorageData["id"],
    methodName: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService remove`, {
        itemId,
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.remove(itemId);
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Retrieves a specific item from the client-specific storage identified by storageName and clientId, using the item’s ID.
   * Wraps StorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., fetching client-specific data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics per client).
   */
  public get = async (
    itemId: IStorageData["id"],
    methodName: string,
    clientId: string,
    storageName: StorageName
  ): Promise<IStorageData | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService get`, {
        methodName,
        itemId,
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.get(itemId);
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Retrieves a list of all items from the client-specific storage identified by storageName and clientId, optionally filtered by a predicate function.
   * Wraps StorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., listing client-specific storage in EXECUTE_FN) and DocService (e.g., documenting storage contents per client).
   */
  public list = async (
    methodName: string,
    clientId: string,
    storageName: StorageName,
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService list`, {
        methodName,
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.list(filter);
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Clears all items from the client-specific storage identified by storageName and clientId.
   * Wraps StorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., resetting client-specific storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets per client).
   */
  public clear = async (
    methodName: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storagePublicService clear`, {
        methodName,
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.clear();
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };

  /**
   * Disposes of the client-specific storage identified by storageName and clientId, cleaning up resources.
   * Wraps StorageConnectionService.dispose with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Aligns with ClientAgent’s cleanup (e.g., post-EXECUTE_FN) and PerfService’s dispose (e.g., clearing client-specific storage).
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    storageName: StorageName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("storagePublicService dispose", {
        clientId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.storageConnectionService.dispose();
      },
      {
        methodName,
        clientId,
        storageName,
        policyName: "",
        agentName: "",
        swarmName: "",
        stateName: "",
        mcpName: "",
        computeName: "",
      }
    );
  };
}

/**
 * Default export of the StoragePublicService class.
 * Provides the primary public interface for client-specific storage operations in the swarm system, integrating with ClientAgent, PerfService, and DocService.
*/
export default StoragePublicService;
