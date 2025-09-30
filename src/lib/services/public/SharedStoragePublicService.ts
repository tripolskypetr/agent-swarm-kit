import { inject } from "../../core/di";
import { SharedStorageConnectionService } from "../connection/SharedStorageConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IStorageData, StorageName } from "../../../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Interface extending SharedStorageConnectionService for type definition purposes.
 * Used to define TSharedStorageConnectionService by excluding internal keys, ensuring SharedStoragePublicService aligns with public-facing operations.
*/
interface ISharedStorageConnectionService extends SharedStorageConnectionService {}

/**
 * Type representing keys to exclude from ISharedStorageConnectionService (internal methods).
 * Used to filter out non-public methods like getStorage and getSharedStorage in TSharedStorageConnectionService.
*/
type InternalKeys = keyof {
  getStorage: never;
  getSharedStorage: never;
};

/**
 * Type representing the public interface of SharedStoragePublicService, derived from ISharedStorageConnectionService.
 * Excludes internal methods (e.g., getStorage, getSharedStorage) via InternalKeys, ensuring a consistent public API for shared storage operations.
*/
type TSharedStorageConnectionService = {
  [key in Exclude<keyof ISharedStorageConnectionService, InternalKeys>]: unknown;
};

/**
 * Service class for managing public shared storage operations in the swarm system.
 * Implements TSharedStorageConnectionService to provide a public API for shared storage interactions, delegating to SharedStorageConnectionService and wrapping calls with MethodContextService for context scoping.
 * Integrates with ClientAgent (e.g., storing/retrieving data in EXECUTE_FN), PerfService (e.g., tracking storage usage in sessionState), and DocService (e.g., documenting storage schemas via storageName).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), supporting operations like retrieving, upserting, removing, listing, and clearing items in shared storage across the system.
*/
export class SharedStoragePublicService implements TSharedStorageConnectionService {
  /**
   * Logger service instance, injected via DI, for logging shared storage operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStatePublicService and PerfService logging patterns.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Shared storage connection service instance, injected via DI, for underlying storage operations.
   * Provides core functionality (e.g., take, upsert) called by public methods, supporting ClientAgent’s storage needs.
   */
  private readonly sharedStorageConnectionService = inject<SharedStorageConnectionService>(
    TYPES.sharedStorageConnectionService
  );

  /**
   * Retrieves a list of storage items based on a search query, total count, and optional score, from a storage identified by storageName.
   * Wraps SharedStorageConnectionService.take with MethodContextService for scoping, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., searching storage in EXECUTE_FN) and DocService (e.g., documenting searchable storage data).
  */
  public take = async (
    search: string,
    total: number,
    methodName: string,
    storageName: StorageName,
    score?: number
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService take`, {
        methodName,
        search,
        total,
        storageName,
        score,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.take(search, total, score);
      },
      {
        methodName,
        clientId: "",
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
   * Upserts (inserts or updates) an item in the shared storage identified by storageName.
   * Wraps SharedStorageConnectionService.upsert with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., storing data in EXECUTE_FN) and PerfService (e.g., tracking storage updates in sessionState).
   */
  public upsert = async (
    item: IStorageData,
    methodName: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService upsert`, {
        item,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.upsert(item);
      },
      {
        methodName,
        clientId: "",
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
   * Removes an item from the shared storage identified by storageName, using the item’s ID.
   * Wraps SharedStorageConnectionService.remove with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., deleting data in EXECUTE_FN) and PerfService (e.g., tracking storage cleanup).
   */
  public remove = async (
    itemId: IStorageData["id"],
    methodName: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService remove`, {
        itemId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.remove(itemId);
      },
      {
        methodName,
        clientId: "",
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
   * Retrieves a specific item from the shared storage identified by storageName, using the item’s ID.
   * Wraps SharedStorageConnectionService.get with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., fetching data in EXECUTE_FN) and PerfService (e.g., reading storage for metrics).
   */
  public get = async (
    itemId: IStorageData["id"],
    methodName: string,
    storageName: StorageName
  ): Promise<IStorageData | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService get`, {
        methodName,
        itemId,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.get(itemId);
      },
      {
        methodName,
        clientId: "",
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
   * Retrieves a list of all items from the shared storage identified by storageName, optionally filtered by a predicate function.
   * Wraps SharedStorageConnectionService.list with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Used in ClientAgent (e.g., listing storage in EXECUTE_FN) and DocService (e.g., documenting storage contents).
   */
  public list = async (
    methodName: string,
    storageName: StorageName,
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService list`, {
        methodName,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.list(filter);
      },
      {
        methodName,
        clientId: "",
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
   * Clears all items from the shared storage identified by storageName.
   * Wraps SharedStorageConnectionService.clear with MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., resetting storage in EXECUTE_FN) and PerfService (e.g., clearing storage for performance resets).
  */
  public clear = async (
    methodName: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStoragePublicService clear`, {
        methodName,
        storageName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedStorageConnectionService.clear();
      },
      {
        methodName,
        clientId: "",
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
 * Default export of the SharedStoragePublicService class.
 * Provides the primary public interface for shared storage operations in the swarm system, integrating with ClientAgent, PerfService, and DocService.
*/
export default SharedStoragePublicService;
