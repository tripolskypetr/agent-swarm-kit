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
 * Service class for managing swarm metadata and converting it to UML format in the swarm system.
 * Builds IMetaNode trees from swarm schemas (via SwarmSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeSwarmDoc UML diagrams).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), AgentMetaService for agent node creation, and supports ClientAgent (e.g., swarm-agent relationships) and PerfService (e.g., computeClientState context).
 * Provides methods to create swarm nodes and generate UML strings, enhancing system documentation and debugging.
 */
export class SwarmMetaService {
  /**
   * Logger service instance, injected via DI, for logging swarm metadata operations.
   * Used in makeSwarmNode and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and AgentMetaService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Swarm schema service instance, injected via DI, for retrieving swarm schema data (e.g., defaultAgent).
   * Used in makeSwarmNode to build meta nodes, aligning with ClientAgent’s swarm definitions and DocService’s swarm documentation.
   * @private
   */
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Agent meta service instance, injected via DI, for creating agent meta nodes within swarm trees.
   * Used in makeSwarmNode to include the default agent, linking to ClientAgent’s agent metadata and DocService’s agent UML generation.
   * @private
   */
  private readonly agentMetaService = inject<AgentMetaService>(
    TYPES.agentMetaService
  );

  /**
   * Serialization function created by createSerialize from AgentMetaService, used to convert IMetaNode trees to UML format.
   * Employed in toUML to generate strings for DocService’s UML diagrams (e.g., swarm_schema_[swarmName].svg), ensuring consistency with AgentMetaService.
   * @private
   */
  private serialize = createSerialize();

  /**
   * Creates a meta node for the given swarm, including its default agent as a child node.
   * Builds a tree using SwarmSchemaService for swarm data and AgentMetaService for the default agent node, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports ClientAgent (e.g., swarm-agent linkage) and DocService (e.g., swarm UML in writeSwarmDoc), used in toUML for visualization.
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
   * Converts the swarm metadata to UML format for visualization.
   * Uses makeSwarmNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Called by DocService (e.g., writeSwarmDoc) to produce UML diagrams (e.g., swarm_schema_[swarmName].svg), enhancing swarm visualization.
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

/**
 * Default export of the SwarmMetaService class.
 * Provides the primary interface for managing swarm metadata and UML generation in the swarm system, integrating with ClientAgent, PerfService, DocService, and AgentMetaService.
 */
export default SwarmMetaService;
