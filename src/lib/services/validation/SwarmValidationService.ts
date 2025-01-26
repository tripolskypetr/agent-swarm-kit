import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SwarmName, ISwarmSchema } from "../../../interfaces/Swarm.interface";
import AgentValidationService from "./AgentValidationService";
import { memoize } from "functools-kit";

/**
 * Service for validating swarms and their agents.
 */
export class SwarmValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  private _swarmMap = new Map<SwarmName, ISwarmSchema>();

  /**
   * Adds a new swarm to the swarm map.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {ISwarmSchema} swarmSchema - The schema of the swarm.
   * @throws Will throw an error if the swarm already exists.
   */
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

  /**
   * Retrieves the list of agents for a given swarm.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {string[]} The list of agent names.
   * @throws Will throw an error if the swarm is not found.
   */
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

  /**
   * Validates a swarm and its agents.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the swarm is not found or if the default agent is not in the agent list.
   */
  public validate = memoize(
    ([swarmName]) => swarmName,
    (swarmName: SwarmName, source: string) => {
      this.loggerService.log("swarmValidationService validate", {
        swarmName,
        source,
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
        this.agentValidationService.validate(agentName, source)
      );
    }
  ) as (swarmName: SwarmName, source: string) => void;
}

export default SwarmValidationService;
