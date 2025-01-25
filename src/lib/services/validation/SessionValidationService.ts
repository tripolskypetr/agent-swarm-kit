import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { SessionId } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { AgentName } from "../../../interfaces/Agent.interface";

export class SessionValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _historySwarmMap = new Map<SessionId, AgentName[]>();
  private _sessionSwarmMap = new Map<SessionId, SwarmName>();
  private _agentSwarmMap = new Map<SessionId, AgentName[]>();

  public addSession = (clientId: SessionId, swarmName: SwarmName) => {
    this.loggerService.log("sessionValidationService addSession", {
      clientId,
    });
    if (this._sessionSwarmMap.has(clientId)) {
      throw new Error(`agent-swarm session clientId=${clientId} already exist`);
    }
    this._sessionSwarmMap.set(clientId, swarmName);
  };

  public addAgentUsage = (sessionId: SessionId, agentName: AgentName): void => {
    this.loggerService.log("sessionValidationService addAgentUsage", {
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

  public addHistoryUsage = (sessionId: SessionId, agentName: AgentName): void => {
    this.loggerService.log("sessionValidationService addHistoryUsage", {
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

  public removeAgentUsage = (
    sessionId: SessionId,
    agentName: AgentName
  ): void => {
    this.loggerService.log("sessionValidationService removeAgentUsage", {
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

  public removeHistoryUsage = (
    sessionId: SessionId,
    agentName: AgentName
  ): void => {
    this.loggerService.log("sessionValidationService removeHistoryUsage", {
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

  public getSessionList = () => {
    this.loggerService.log("sessionValidationService getSessionList");
    return [...this._sessionSwarmMap.keys()];
  };

  public getSessionAgentList = (clientId: string) => {
    this.loggerService.log("sessionValidationService getSessionAgentList", {
      clientId,
    });
    return this._agentSwarmMap.get(clientId) ?? [];
  };

  public getSessionHistoryList = (clientId: string) => {
    this.loggerService.log("sessionValidationService getSessionHistoryList", {
      clientId,
    });
    return this._agentSwarmMap.get(clientId) ?? [];
  };

  public getSwarm = (clientId: SessionId) => {
    this.loggerService.log("sessionValidationService getSwarm", {
      clientId,
    });
    const session = this._sessionSwarmMap.get(clientId);
    if (session === undefined) {
      throw new Error(`agent-swarm session clientId=${clientId} not found`);
    }
    return session;
  };

  public validate = (clientId: SessionId, source: string) => {
    this.loggerService.log("sessionValidationService validate", { clientId });
    if (!this._sessionSwarmMap.has(clientId)) {
      throw new Error(
        `agent-swarm session clientId=${clientId} not exist source=${source}`
      );
    }
  };

  public removeSession = (clientId: SessionId) => {
    this.loggerService.log("sessionValidationService addSession", {
      clientId,
    });
    this._sessionSwarmMap.delete(clientId);
  };
}

export default SessionValidationService;
