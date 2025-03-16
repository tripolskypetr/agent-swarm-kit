import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SessionId } from "../../../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service class for managing in-memory data for different sessions in the swarm system.
 * Provides a simple key-value store using a Map, associating SessionId (as clientId) with arbitrary objects, with methods to write, read, and dispose of session-specific memory data.
 * Integrates with SessionConnectionService (session-specific memory management), ClientAgent (potential runtime memory for agents), PerfService (tracking via logging), and SessionPublicService (public session API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during write, read, and dispose operations.
 * Acts as a lightweight, non-persistent memory layer for session-scoped data, distinct from StateConnectionService or StorageConnectionService, with no schema validation or persistence.
 */
export class MemorySchemaService {
  /**
   * Logger service instance, injected via DI, for logging memory operations.
   * Used in writeValue, readValue, and dispose methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SessionConnectionService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Map instance for storing session-specific memory data.
   * Maps SessionId (as clientId) to arbitrary objects, providing a simple in-memory store, used in writeValue, readValue, and dispose methods.
   * Not persisted, serving as a transient memory layer for session runtime data.
   * @type {Map<SessionId, object>}
   * @private
   */
  private memoryMap = new Map<SessionId, object>();

  /**
   * Writes a value to the memory map for a given client ID, merging it with existing data.
   * Merges the provided value with any existing object for the clientId using Object.assign, then stores the result in the memoryMap, returning the merged value.
   * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s session data needs.
   * Supports ClientAgent by providing a flexible, session-scoped memory store for runtime data.
   * @template T - The type of the value to be written, extending object, defaulting to a generic object.
   * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
   * @param {T} value - The value to write, merged with existing data if present.
   * @returns {T} The merged value stored in the memory map, reflecting the updated session data.
   */
  public writeValue = <T extends object = object>(
    clientId: string,
    value: T
  ): T => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService setValue`, {
        clientId,
        value,
      });
    const pendingValue = Object.assign(
      this.memoryMap.get(clientId) ?? {},
      value
    );
    this.memoryMap.set(clientId, pendingValue);
    return pendingValue;
  };

  /**
   * Reads a value from the memory map for a given client ID, returning an empty object if not found.
   * Retrieves the stored object for the clientId from the memoryMap, defaulting to an empty object if no entry exists, cast to the generic type T.
   * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionPublicService’s data access needs.
   * Supports ClientAgent by providing access to session-scoped runtime memory.
   * @template T - The type of the value to be read, extending object, defaulting to a generic object.
   * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
   * @returns {T} The value associated with the clientId, or an empty object if none exists, cast to type T.
   */
  public readValue = <T extends object = object>(clientId: string): T => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService getValue`, {
        clientId,
      });
    return (this.memoryMap.get(clientId) ?? {}) as T;
  };

  /**
   * Disposes of the memory map entry for a given client ID, removing it from storage.
   * Deletes the entry associated with the clientId from the memoryMap, effectively clearing session-specific data.
   * Logs the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with SessionConnectionService’s cleanup needs.
   * Supports session termination or reset scenarios in SessionPublicService and ClientAgent workflows.
   * @param {string} clientId - The ID of the client, typed as SessionId from Session.interface, scoping the memory to a session.
   */
  public dispose = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService dispose`, {
        clientId,
      });
    this.memoryMap.delete(clientId);
  };
}

/**
 * Default export of the MemorySchemaService class.
 * Provides the primary service for managing in-memory session data in the swarm system, integrating with SessionConnectionService, ClientAgent, PerfService, and SessionPublicService, with a lightweight Map-based store.
 * @type {typeof MemorySchemaService}
 */
export default MemorySchemaService;
