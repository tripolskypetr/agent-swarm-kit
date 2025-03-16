import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SessionId, SessionMode } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { AgentName } from "../../../interfaces/Agent.interface";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { memoize } from "functools-kit";

/**
 * Service for managing and validating sessions within the swarm system.
 * Tracks session associations with swarms, modes, agents, histories, storages, and states,
 * ensuring session existence and resource usage consistency.
 * Integrates with SessionConnectionService (session management), ClientSession (session lifecycle),
 * ClientAgent (agent usage), ClientStorage (storage usage), ClientState (state usage),
 * SwarmSchemaService (swarm association), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
export class SessionValidationService {
  /**
   * Logger service instance for logging session operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Map of session IDs to their associated storage names, tracking storage usage per session.
   * Populated by addStorageUsage, modified by removeStorageUsage.
   * @type {Map<SessionId, StorageName[]>}
   * @private
   */
  private _storageSwarmMap = new Map<SessionId, StorageName[]>();

  /**
   * Map of session IDs to their associated agent names for history tracking.
   * Populated by addHistoryUsage, modified by removeHistoryUsage.
   * @type {Map<SessionId, AgentName[]>}
   * @private
   */
  private _historySwarmMap = new Map<SessionId, AgentName[]>();

  /**
   * Map of session IDs to their associated agent names for active usage.
   * Populated by addAgentUsage, modified by removeAgentUsage.
   * @type {Map<SessionId, AgentName[]>}
   * @private
   */
  private _agentSwarmMap = new Map<SessionId, AgentName[]>();

  /**
   * Map of session IDs to their associated state names, tracking state usage per session.
   * Populated by addStateUsage, modified by removeStateUsage.
   * @type {Map<SessionId, StateName[]>}
   * @private
   */
  private _stateSwarmMap = new Map<SessionId, StateName[]>();

  /**
   * Map of session IDs to their associated swarm names, defining session-swarm relationships.
   * Populated by addSession, removed by removeSession.
   * @type {Map<SessionId, SwarmName>}
   * @private
   */
  private _sessionSwarmMap = new Map<SessionId, SwarmName>();

  /**
   * Map of session IDs to their modes, defining session behavior.
   * Populated by addSession, removed by removeSession.
   * @type {Map<SessionId, SessionMode>}
   * @private
   */
  private _sessionModeMap = new Map<SessionId, SessionMode>();

  /**
   * Registers a new session with its swarm and mode.
   * Logs the operation and ensures uniqueness, supporting SessionConnectionService’s session creation.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @param {SwarmName} swarmName - The name of the associated swarm, sourced from Swarm.interface.
   * @param {SessionMode} sessionMode - The mode of the session (e.g., "active", "passive"), sourced from Session.interface.
   * @throws {Error} If the session already exists in _sessionSwarmMap.
   */
  public addSession = (
    clientId: SessionId,
    swarmName: SwarmName,
    sessionMode: SessionMode
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addSession", {
        clientId,
      });
    if (!clientId) {
      console.error(`agent-swarm session clientId=${clientId} already exist`);
      return;
    }
    if (this._sessionSwarmMap.has(clientId)) {
      throw new Error(`agent-swarm session clientId=${clientId} already exist`);
    }
    this._sessionSwarmMap.set(clientId, swarmName);
    this._sessionModeMap.set(clientId, sessionMode);
  };

  /**
   * Tracks an agent’s usage within a session, adding it to the session’s agent list.
   * Logs the operation, supporting ClientAgent’s session-specific activity tracking.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {AgentName} agentName - The name of the agent to add, sourced from Agent.interface.
   */
  public addAgentUsage = (sessionId: SessionId, agentName: AgentName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addAgentUsage", {
        sessionId,
        agentName,
      });
    if (this._agentSwarmMap.has(sessionId)) {
      const agents = this._agentSwarmMap.get(sessionId)!;
      if (!agents.includes(agentName)) {
        agents.push(agentName);
      }
    } else {
      this._agentSwarmMap.set(sessionId, [agentName]);
    }
  };

  /**
   * Tracks an agent’s history usage within a session, adding it to the session’s history list.
   * Logs the operation, supporting ClientHistory’s session-specific history tracking.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {AgentName} agentName - The name of the agent to add, sourced from Agent.interface.
   */
  public addHistoryUsage = (
    sessionId: SessionId,
    agentName: AgentName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addHistoryUsage", {
        sessionId,
        agentName,
      });
    if (this._historySwarmMap.has(sessionId)) {
      const agents = this._historySwarmMap.get(sessionId)!;
      if (!agents.includes(agentName)) {
        agents.push(agentName);
      }
    } else {
      this._historySwarmMap.set(sessionId, [agentName]);
    }
  };

  /**
   * Tracks a storage’s usage within a session, adding it to the session’s storage list.
   * Logs the operation, supporting ClientStorage’s session-specific storage tracking.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {StorageName} storageName - The name of the storage to add, sourced from Storage.interface.
   */
  public addStorageUsage = (
    sessionId: SessionId,
    storageName: StorageName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addStorageUsage", {
        sessionId,
        storageName,
      });
    if (this._storageSwarmMap.has(sessionId)) {
      const storages = this._storageSwarmMap.get(sessionId)!;
      if (!storages.includes(storageName)) {
        storages.push(storageName);
      }
    } else {
      this._storageSwarmMap.set(sessionId, [storageName]);
    }
  };

  /**
   * Tracks a state’s usage within a session, adding it to the session’s state list.
   * Logs the operation, supporting ClientState’s session-specific state tracking.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {StateName} stateName - The name of the state to add, sourced from State.interface.
   */
  public addStateUsage = (sessionId: SessionId, stateName: StateName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addStateUsage", {
        sessionId,
        stateName,
      });
    if (this._stateSwarmMap.has(sessionId)) {
      const states = this._stateSwarmMap.get(sessionId)!;
      if (!states.includes(stateName)) {
        states.push(stateName);
      }
    } else {
      this._stateSwarmMap.set(sessionId, [stateName]);
    }
  };

  /**
   * Removes an agent from a session’s agent usage list.
   * Logs the operation and cleans up if the list becomes empty, supporting ClientAgent’s session cleanup.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {AgentName} agentName - The name of the agent to remove, sourced from Agent.interface.
   * @throws {Error} If no agents are found for the session in _agentSwarmMap.
   */
  public removeAgentUsage = (
    sessionId: SessionId,
    agentName: AgentName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService removeAgentUsage", {
        sessionId,
        agentName,
      });
    if (this._agentSwarmMap.has(sessionId)) {
      const agents = this._agentSwarmMap.get(sessionId)!;
      const agentIndex = agents.indexOf(agentName);
      if (agentIndex !== -1) {
        agents.splice(agentIndex, 1);
      }
      if (agents.length === 0) {
        this._agentSwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No agents found for sessionId=${sessionId}`);
    }
  };

  /**
   * Removes an agent from a session’s history usage list.
   * Logs the operation and cleans up if the list becomes empty, supporting ClientHistory’s session cleanup.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {AgentName} agentName - The name of the agent to remove, sourced from Agent.interface.
   * @throws {Error} If no agents are found for the session in _historySwarmMap.
   */
  public removeHistoryUsage = (
    sessionId: SessionId,
    agentName: AgentName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService removeHistoryUsage", {
        sessionId,
        agentName,
      });
    if (this._historySwarmMap.has(sessionId)) {
      const agents = this._historySwarmMap.get(sessionId)!;
      const agentIndex = agents.indexOf(agentName);
      if (agentIndex !== -1) {
        agents.splice(agentIndex, 1);
      }
      if (agents.length === 0) {
        this._historySwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No agents found for sessionId=${sessionId}`);
    }
  };

  /**
   * Removes a storage from a session’s storage usage list.
   * Logs the operation and cleans up if the list becomes empty, supporting ClientStorage’s session cleanup.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {StorageName} storageName - The name of the storage to remove, sourced from Storage.interface.
   * @throws {Error} If no storages are found for the session in _storageSwarmMap.
   */
  public removeStorageUsage = (
    sessionId: SessionId,
    storageName: StorageName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService removeStorageUsage", {
        sessionId,
        storageName,
      });
    if (this._storageSwarmMap.has(sessionId)) {
      const storages = this._storageSwarmMap.get(sessionId)!;
      const storageIndex = storages.indexOf(storageName);
      if (storageIndex !== -1) {
        storages.splice(storageIndex, 1);
      }
      if (storages.length === 0) {
        this._storageSwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No storages found for sessionId=${sessionId}`);
    }
  };

  /**
   * Removes a state from a session’s state usage list.
   * Logs the operation and cleans up if the list becomes empty, supporting ClientState’s session cleanup.
   * @param {SessionId} sessionId - The ID of the session, sourced from Session.interface.
   * @param {StateName} stateName - The name of the state to remove, sourced from State.interface.
   * @throws {Error} If no states are found for the session in _stateSwarmMap.
   */
  public removeStateUsage = (
    sessionId: SessionId,
    stateName: StateName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService removeStateUsage", {
        sessionId,
        stateName,
      });
    if (this._stateSwarmMap.has(sessionId)) {
      const states = this._stateSwarmMap.get(sessionId)!;
      const stateIndex = states.indexOf(stateName);
      if (stateIndex !== -1) {
        states.splice(stateIndex, 1);
      }
      if (states.length === 0) {
        this._stateSwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No states found for sessionId=${sessionId}`);
    }
  };

  /**
   * Retrieves the mode of a session.
   * Logs the operation and validates session existence, supporting ClientSession’s mode-based behavior.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @returns {SessionMode} The mode of the session (e.g., "active", "passive").
   * @throws {Error} If the session does not exist in _sessionModeMap.
   */
  public getSessionMode = (clientId: SessionId): SessionMode => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSessionMode", {
        clientId,
      });
    if (!this._sessionModeMap.has(clientId)) {
      throw new Error(
        `agent-swarm session getSessionMode clientId=${clientId} session not exist`
      );
    }
    return this._sessionModeMap.get(clientId)!;
  };

  /**
   * Checks if a session exists.
   * Logs the operation, supporting quick existence checks for SessionConnectionService.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @returns {boolean} True if the session exists in _sessionSwarmMap, false otherwise.
   */
  public hasSession = (clientId: SessionId): boolean => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService hasSession", {
        clientId,
      });
    return this._sessionSwarmMap.has(clientId);
  };

  /**
   * Retrieves the list of all registered session IDs.
   * Logs the operation, supporting SessionConnectionService’s session enumeration.
   * @returns {SessionId[]} An array of all session IDs from _sessionSwarmMap.
   */
  public getSessionList = (): SessionId[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSessionList");
    return [...this._sessionSwarmMap.keys()];
  };

  /**
   * Retrieves the list of agents associated with a session.
   * Logs the operation, supporting ClientAgent’s session-specific agent queries.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @returns {AgentName[]} An array of agent names from _agentSwarmMap, or empty array if none.
   */
  public getSessionAgentList = (clientId: SessionId): AgentName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSessionAgentList", {
        clientId,
      });
    return this._agentSwarmMap.get(clientId) ?? [];
  };

  /**
   * Retrieves the list of agents in a session’s history.
   * Logs the operation, supporting ClientHistory’s session-specific history queries.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @returns {AgentName[]} An array of agent names from _historySwarmMap, or empty array if none.
   */
  public getSessionHistoryList = (clientId: SessionId): AgentName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(
        "sessionValidationService getSessionHistoryList",
        {
          clientId,
        }
      );
    return this._historySwarmMap.get(clientId) ?? [];
  };

  /**
   * Retrieves the swarm name associated with a session.
   * Logs the operation and validates session existence, supporting SwarmSchemaService’s session-swarm mapping.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @returns {SwarmName} The name of the associated swarm from _sessionSwarmMap.
   * @throws {Error} If the session does not exist in _sessionSwarmMap.
   */
  public getSwarm = (clientId: SessionId): SwarmName => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSwarm", {
        clientId,
      });
    const session = this._sessionSwarmMap.get(clientId);
    if (session === undefined) {
      throw new Error(`agent-swarm session clientId=${clientId} not found`);
    }
    return session;
  };

  /**
   * Validates if a session exists, memoized by clientId for performance.
   * Logs the operation and checks existence, supporting ClientSession’s session validation needs.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   * @param {string} source - The source of the validation request (e.g., "session-init"), for error context.
   * @throws {Error} If the clientId is missing or the session does not exist in _sessionSwarmMap.
   */
  public validate = memoize(
    ([clientId]) => `${clientId}`,
    (clientId: SessionId, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("sessionValidationService validate", {
          clientId,
        });
      if (!clientId) {
        throw new Error(
          `agent-swarm session clientId is missing source=${source}`
        );
      }
      if (!this._sessionSwarmMap.has(clientId)) {
        throw new Error(
          `agent-swarm session clientId=${clientId} not exist source=${source}`
        );
      }
    }
  );

  /**
   * Removes a session and its associated mode, clearing validation cache.
   * Logs the operation, supporting SessionConnectionService’s session cleanup.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   */
  public removeSession = (clientId: SessionId): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService removeSession", {
        clientId,
      });
    this._sessionSwarmMap.delete(clientId);
    this._sessionModeMap.delete(clientId);
    this.validate.clear(clientId);
  };

  /**
   * Clears the validation cache for a specific session.
   * Logs the operation, supporting resource cleanup without removing session data.
   * @param {SessionId} clientId - The ID of the session (client ID), sourced from Session.interface.
   */
  public dispose = (clientId: SessionId): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService dispose", {
        clientId,
      });
    this.validate.clear(clientId);
  };
}

/**
 * Default export of the SessionValidationService class.
 * Provides a service for managing and validating sessions in the swarm system,
 * integrating with SessionConnectionService, ClientSession, ClientAgent, ClientStorage,
 * ClientState, SwarmSchemaService, and LoggerService,
 * with memoized validation and comprehensive session resource tracking.
 * @type {typeof SessionValidationService}
 */
export default SessionValidationService;
