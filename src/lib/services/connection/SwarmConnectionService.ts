import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import ClientSwarm from "src/client/ClientSwarm";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import AgentConnectionService from "./AgentConnectionService";
import { AgentName, IAgent } from "src/interfaces/Agent.interface";
import ISwarm from "src/interfaces/Swarm.interface";

export class SwarmConnectionService implements ISwarm {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  public getSwarm = memoize(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    (clientId: string, swarmName: string) => {
      const { agentList, defaultAgent } = this.swarmSchemaService.get(swarmName);
      const agentMap: Record<AgentName, IAgent> = {};
      for (const agentName of agentList) {
        agentMap[agentName] = this.agentConnectionService.getAgent(
          clientId,
          agentName
        );
      }
      return new ClientSwarm({
        clientId,
        agentMap,
        defaultAgent,
        logger: this.loggerService,
      });
    }
  );

  public waitForOutput = async () => {
    this.loggerService.log(`swarmConnectionService waitForOutput`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).waitForOutput();
  };

  public getAgentName = async () => {
    this.loggerService.log(`swarmConnectionService getAgentName`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).getAgentName();
  };

  public getAgent = async () => {
    this.loggerService.log(`swarmConnectionService getAgent`, {
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).getAgent();
  };

  public setAgentName = async (agentName: AgentName) => {
    this.loggerService.log(`swarmConnectionService setAgentName`, {
      agentName,
      context: this.contextService.context,
    });
    return await this.getSwarm(
      this.contextService.context.clientId,
      this.contextService.context.swarmName
    ).setAgentName(agentName);
  };

  public dispose = async () => {
    this.loggerService.log(`swarmConnectionService dispose`, {
      context: this.contextService.context,
    });
    this.getSwarm.clear(
      `${this.contextService.context.clientId}-${this.contextService.context.swarmName}`
    );
  };
}

export default SwarmConnectionService;
