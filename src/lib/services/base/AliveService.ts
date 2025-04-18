import { inject } from "../../core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../core/types";
import { SessionId } from "../../../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { PersistAliveAdapter } from "../../../classes/Persist";
import { SwarmName } from "../../../interfaces/Swarm.interface";

/**
 * Service class for managing the online/offline status of clients within swarms.
 * Provides methods to mark clients as online or offline, leveraging persistent storage via `PersistAliveAdapter`.
 */
export class AliveService {
  /** @private Injected logger service for logging operations within the AliveService */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Marks a client as online within a specific swarm and logs the action.
   * Persists the online status using `PersistAliveAdapter` if persistence is enabled in the global configuration.
   * @param {SessionId} clientId - The unique identifier of the client session, a string (e.g., "session123") representing a user session in the swarm system.
   *                               Used to track the specific client’s online status within a `SwarmName`.
   * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
   *                                Defines the context in which the client’s online status is managed and persisted.
   * @param {string} methodName - The name of the calling method (e.g., "someMethod"), used for logging purposes to trace the origin of the call.
   * @returns {Promise<void>} A promise that resolves when the online status is marked and persisted (if enabled).
   */
  public markOnline = async (
    clientId: SessionId,
    swarmName: SwarmName,
    methodName: string
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`aliveService markOnline`, {
        clientId,
        methodName,
        swarmName,
      });
    if (GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT) {
      await PersistAliveAdapter.markOnline(clientId, swarmName);
    }
  };

  /**
   * Marks a client as offline within a specific swarm and logs the action.
   * Persists the offline status using `PersistAliveAdapter` if persistence is enabled in the global configuration.
   * @param {SessionId} clientId - The unique identifier of the client session, a string (e.g., "session123") representing a user session in the swarm system.
   *                               Used to track the specific client’s offline status within a `SwarmName`.
   * @param {SwarmName} swarmName - The name of the swarm, a string identifier (e.g., "swarm1") grouping agents and sessions.
   *                                Defines the context in which the client’s offline status is managed and persisted.
   * @param {string} methodName - The name of the calling method (e.g., "someMethod"), used for logging purposes to trace the origin of the call.
   * @returns {Promise<void>} A promise that resolves when the offline status is marked and persisted (if enabled).
   */
  public markOffline = async (
    clientId: SessionId,
    swarmName: SwarmName,
    methodName: string
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`aliveService markOffline`, {
        clientId,
        methodName,
        swarmName,
      });
    if (GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT) {
      await PersistAliveAdapter.markOffline(clientId, swarmName);
    }
  };
}

/**
 * Default export of the `AliveService` class.
 * Provides a convenient way to import and instantiate the service for managing client alive status.
 * @type {typeof AliveService}
 */
export default AliveService;
