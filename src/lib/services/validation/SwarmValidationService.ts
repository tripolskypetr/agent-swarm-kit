import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { SwarmName, ISwarmSchema } from "src/interfaces/Swarm.interface";
import AgentValidationService from "./AgentValidationService";
import { memoize } from "functools-kit";

export class SwarmValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  private _swarmMap = new Map<SwarmName, ISwarmSchema>();

  public addSwarm = (swarmName: SwarmName, swarmSchema: ISwarmSchema) => {
    this.loggerService.log("swarmValidationService addSwarm", {
      swarmName,
      swarmSchema,
    });
    if (this._swarmMap.has(swarmName)) {
      throw new Error(`swarm-swarm swarm ${swarmName} already exist`);
    }
    this._swarmMap.set(swarmName, swarmSchema);
  };

  public getAgentList = (swarmName: SwarmName) => {
    this.loggerService.log("swarmValidationService getAgentList", {
      swarmName,
    });
    const swarm = this._swarmMap.get(swarmName);
    if (!swarm) {
      throw new Error(`agent-swarm swarm ${swarmName} not found`);
    }
    return swarm.agentList;
  };

  public validate = memoize(
    ([swarmName]) => swarmName,
    (swarmName: SwarmName) => {
      this.loggerService.log("swarmValidationService validate", {
        swarmName,
      });
      const swarm = this._swarmMap.get(swarmName);
      if (!swarm) {
        throw new Error(`agent-swarm swarm ${swarmName} not found`);
      }
      if (!swarm.agentList.includes(swarm.defaultAgent)) {
        throw new Error(
          `agent-swarm swarm ${swarmName} default agent not in agent list`
        );
      }
      swarm.agentList.forEach((agentName) =>
        this.agentValidationService.validate(agentName)
      );
    }
  ) as (swarmName: SwarmName) => void;
}

export default SwarmValidationService;
