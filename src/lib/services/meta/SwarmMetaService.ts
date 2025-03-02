import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import AgentMetaService, {
  createSerialize,
  IMetaNode,
} from "./AgentMetaService";

/**
 * Service for handling swarm metadata.
 */
export class SwarmMetaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  private readonly agentMetaService = inject<AgentMetaService>(
    TYPES.agentMetaService
  );

  private serialize = createSerialize();

  /**
   * Creates a swarm node with the given swarm name.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {IMetaNode} The metadata node of the swarm.
   */
  public makeSwarmNode = (swarmName: SwarmName): IMetaNode => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmMetaService makeSwarmNode", {
        swarmName,
      });
    const { defaultAgent } = this.swarmSchemaService.get(swarmName);
    return {
      name: swarmName,
      child: [this.agentMetaService.makeAgentNodeCommon(defaultAgent)],
    };
  };

  /**
   * Converts the swarm metadata to UML format.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {string} The UML representation of the swarm.
   */
  public toUML = (swarmName: SwarmName): string => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmMetaService toUML", {
        swarmName,
      });
    const rootNode = this.makeSwarmNode(swarmName);
    return this.serialize([rootNode]);
  };
}

export default SwarmMetaService;
