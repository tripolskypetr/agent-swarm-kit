import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SessionId, SessionMode } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { AgentName } from "../../../interfaces/Agent.interface";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating and managing sessions.
 */
export class SessionValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _storageSwarmMap = new Map<SessionId, StorageName[]>();
  private _historySwarmMap = new Map<SessionId, AgentName[]>();
  private _agentSwarmMap = new Map<SessionId, AgentName[]>();
  private _stateSwarmMap = new Map<SessionId, AgentName[]>();

  private _sessionSwarmMap = new Map<SessionId, SwarmName>();
  private _sessionModeMap = new Map<SessionId, SessionMode>();

  /**
   * Adds a new session.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {SessionMode} sessionMode - The mode of the session.
   * @throws Will throw an error if the session already exists.
   */
  public addSession = (
    clientId: SessionId,
    swarmName: SwarmName,
    sessionMode: SessionMode
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addSession", {
        clientId,
      });
    if (this._sessionSwarmMap.has(clientId)) {
      throw new Error(`agent-swarm session clientId=${clientId} already exist`);
    }
    this._sessionSwarmMap.set(clientId, swarmName);
    this._sessionModeMap.set(clientId, sessionMode);
  };

  /**
   * Adds an agent usage to a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {AgentName} agentName - The name of the agent.
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
   * Adds a history usage to a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {AgentName} agentName - The name of the agent.
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
   * Adds a storage usage to a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {StorageName} storageName - The name of the storage.
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
   * Adds a state usage to a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {StateName} stateName - The name of the state.
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
   * Removes an agent usage from a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {AgentName} agentName - The name of the agent.
   * @throws Will throw an error if no agents are found for the session.
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
   * Removes a history usage from a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {AgentName} agentName - The name of the agent.
   * @throws Will throw an error if no agents are found for the session.
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
   * Removes a storage usage from a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {StorageName} storageName - The name of the storage.
   * @throws Will throw an error if no storages are found for the session.
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
      const agents = this._storageSwarmMap.get(sessionId)!;
      const agentIndex = agents.indexOf(storageName);
      if (agentIndex !== -1) {
        agents.splice(agentIndex, 1);
      }
      if (agents.length === 0) {
        this._storageSwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No agents found for sessionId=${sessionId}`);
    }
  };

  /**
   * Removes a state usage from a session.
   * @param {SessionId} sessionId - The ID of the session.
   * @param {StateName} stateName - The name of the state.
   * @throws Will throw an error if no states are found for the session.
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
      const agents = this._stateSwarmMap.get(sessionId)!;
      const agentIndex = agents.indexOf(stateName);
      if (agentIndex !== -1) {
        agents.splice(agentIndex, 1);
      }
      if (agents.length === 0) {
        this._stateSwarmMap.delete(sessionId);
      }
    } else {
      throw new Error(`No agents found for sessionId=${sessionId}`);
    }
  };

  /**
   * Gets the mode of a session.
   * @param {SessionId} clientId - The ID of the client.
   * @returns {SessionMode} The mode of the session.
   * @throws Will throw an error if the session does not exist.
   */
  public getSessionMode = (clientId: SessionId) => {
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
   * Ensures session is exist
   * @returns {boolean}
   */
  public hasSession = (clientId: SessionId) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService hasSession");
    return this._sessionSwarmMap.has(clientId);
  };

  /**
   * Gets the list of all session IDs.
   * @returns {SessionId[]} The list of session IDs.
   */
  public getSessionList = () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSessionList");
    return [...this._sessionSwarmMap.keys()];
  };

  /**
   * Gets the list of agents for a session.
   * @param {string} clientId - The ID of the client.
   * @returns {AgentName[]} The list of agent names.
   */
  public getSessionAgentList = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService getSessionAgentList", {
        clientId,
      });
    return this._agentSwarmMap.get(clientId) ?? [];
  };

  /**
   * Gets the history list of agents for a session.
   * @param {string} clientId - The ID of the client.
   * @returns {AgentName[]} The list of agent names.
   */
  public getSessionHistoryList = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(
        "sessionValidationService getSessionHistoryList",
        {
          clientId,
        }
      );
    return this._agentSwarmMap.get(clientId) ?? [];
  };

  /**
   * Gets the swarm name for a session.
   * @param {SessionId} clientId - The ID of the client.
   * @returns {SwarmName} The name of the swarm.
   * @throws Will throw an error if the session does not exist.
   */
  public getSwarm = (clientId: SessionId) => {
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
   * Validates if a session exists.
   * @param {SessionId} clientId - The ID of the client.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the session does not exist.
   */
  public validate = (clientId: SessionId, source: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService validate", {
        clientId,
      });
    if (!this._sessionSwarmMap.has(clientId)) {
      throw new Error(
        `agent-swarm session clientId=${clientId} not exist source=${source}`
      );
    }
    return {} as unknown as void;
  };

  /**
   * Removes a session.
   * @param {SessionId} clientId - The ID of the client.
   */
  public removeSession = (clientId: SessionId) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("sessionValidationService addSession", {
        clientId,
      });
    this._sessionSwarmMap.delete(clientId);
    this._sessionModeMap.delete(clientId);
  };
}

export default SessionValidationService;
