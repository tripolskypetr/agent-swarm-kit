import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { AgentName } from "../../../interfaces/Agent.interface";
import AgentSchemaService from "../schema/AgentSchemaService";

/**
 * Maximum nesting level for UML serialization to prevent infinite recursion.
 * Used in createSerialize to limit depth, ensuring safe processing of agent dependencies.
 */
const MAX_NESTING = 10;

/**
 * Indentation step for UML formatting, used in createSerialize for hierarchical representation.
 */
const UML_STEP = "\t";

/**
 * Bullet symbol for UML nodes, used in createSerialize to denote entries.
 */
const UML_BULLET = "[*]";

/**
 * Triangle symbol for UML category headers, used in makeAgentNode to mark sections (e.g., Agents, States).
 */
const UML_TRIANGLE = "[>]";

/**
 * Interface defining a metadata node structure for representing agent relationships and resources.
 * Used in AgentMetaService to build hierarchical trees for UML serialization, reflecting agent dependencies and attributes.
 * @interface IMetaNode
 */
export interface IMetaNode {
  /**
   * The name of the node, typically an agent name or resource identifier (e.g., AgentName, "States").
   */
  name: string;

  /**
   * Optional array of child nodes, representing nested dependencies or resources (e.g., dependent agents, states).
   */
  child?: IMetaNode[];
}

/**
 * Creates a function to serialize an array of IMetaNode objects into UML format (YAML-style).
 * Used by AgentMetaService.toUML to generate visual representations for DocService (e.g., agent UML diagrams).
 */
export const createSerialize = () => (nodes: IMetaNode[]) => {
  const lines: string[] = [];

  /**
   * Recursively processes meta nodes to build UML lines with indentation.
   * Limits nesting to MAX_NESTING, used internally by createSerialize to handle agent trees from AgentMetaService.
   */
  const process = (nodes: IMetaNode[], level = 0) => {
    for (const node of nodes) {
      const space = [...new Array(level)].fill(UML_STEP).join("");
      if (node.child?.length && level < MAX_NESTING) {
        lines.push(`${space}${String(node.name)}:`);
        lines.push(`${space}${UML_STEP}${UML_BULLET} ${String(node.name)}: ""`);
        process(node.child!, level + 1);
      } else {
        lines.push(`${space}${String(node.name)}: ""`);
      }
    }
  };

  process(nodes);

  const result = ["@startyaml", ...lines, "@endyaml"].join("\n");

  return result;
};

/**
 * Service class for managing agent metadata and converting it to UML format in the swarm system.
 * Builds IMetaNode trees from agent schemas (via AgentSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeAgentDoc UML diagrams).
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and supports ClientAgent (e.g., agent metadata) and PerfService (e.g., computeClientState context).
 * Provides methods to create detailed or common agent nodes and generate UML strings, enhancing system documentation and debugging.
 */
export class AgentMetaService {
  /**
   * Logger service instance, injected via DI, for logging meta node operations.
   * Used in makeAgentNode, makeAgentNodeCommon, and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Agent schema service instance, injected via DI, for retrieving agent schema data (e.g., dependsOn, states).
   * Used in makeAgentNode and makeAgentNodeCommon to build meta nodes, aligning with ClientAgent’s agent definitions and DocService’s agent documentation.
   * @private
   */
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );

  /**
   * Serialization function created by createSerialize, used to convert IMetaNode trees to UML format.
   * Employed in toUML to generate strings for DocService’s UML diagrams (e.g., agent_schema_[agentName].svg).
   * @private
   */
  private serialize = createSerialize();

  /**
   * Creates a detailed meta node for the given agent, including dependencies, states, storages, and tools.
   * Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in toUML for full agent visualization.
   * Integrates with ClientAgent (e.g., agent metadata) and DocService (e.g., detailed agent UML in writeAgentDoc).
   */
  public makeAgentNode = (
    agentName: AgentName,
    seen = new Set<AgentName>()
  ): IMetaNode => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentMetaService makeAgentNode", {
        agentName,
      });
    const { dependsOn, states, storages, tools } =
      this.agentSchemaService.get(agentName);

    const agentTree: IMetaNode[] = [];

    if (dependsOn) {
      agentTree.push({
        name: `${UML_TRIANGLE} Agents`,
      });
      const childSeen = new Set(seen).add(agentName);
      const subtree = dependsOn
        .filter((name) => !!name)
        .map(
          !seen.has(agentName)
            ? (name) => this.makeAgentNodeCommon(name, childSeen)
            : (name) => ({ name })
        );
      !subtree.length && subtree.push({ name: "Nothing found" });
      subtree.forEach((node) => agentTree.push(node));
    }

    if (states) {
      agentTree.push({
        name: `${UML_TRIANGLE} States`,
      });
      const subtree = states.filter((name) => !!name).map((name) => ({ name }));
      !subtree.length && subtree.push({ name: "Nothing found" });
      subtree.forEach((node) => agentTree.push(node));
    }

    if (storages) {
      agentTree.push({
        name: `${UML_TRIANGLE} Storages`,
      });
      const subtree = storages
        .filter((name) => !!name)
        .map((name) => ({ name }));
      !subtree.length && subtree.push({ name: "Nothing found" });
      subtree.forEach((node) => agentTree.push(node));
    }

    if (tools) {
      agentTree.push({
        name: `${UML_TRIANGLE} Tools`,
      });
      const subtree = tools.filter((name) => !!name).map((name) => ({ name }));
      !subtree.length && subtree.push({ name: "Nothing found" });
      subtree.forEach((node) => agentTree.push(node));
    }

    return {
      name: agentName,
      child: agentTree,
    };
  };

  /**
   * Creates a common meta node for the given agent, focusing on dependency relationships.
   * Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used as a helper in makeAgentNode.
   * Supports ClientAgent (e.g., dependency tracking) and PerfService (e.g., computeClientState agent context).
   */
  public makeAgentNodeCommon = (
    agentName: AgentName,
    seen = new Set<AgentName>()
  ): IMetaNode => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentMetaService makeAgentNodeCommon", {
        agentName,
      });
    const { dependsOn } = this.agentSchemaService.get(agentName);
    if (seen.has(agentName)) {
      return {
        name: agentName,
      };
    } else if (dependsOn) {
      const childSeen = new Set(seen).add(agentName);
      return {
        name: agentName,
        child: dependsOn.map((name) =>
          this.makeAgentNodeCommon(name, childSeen)
        ),
      };
    } else {
      return {
        name: agentName,
      };
    }
  };

  /**
   * Converts the meta nodes of the given agent to UML format, optionally including a full subtree.
   * Uses makeAgentNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Called by DocService (e.g., writeAgentDoc) to produce UML diagrams (e.g., agent_schema_[agentName].svg), enhancing agent visualization.
   */
  public toUML = (agentName: AgentName, withSubtree = false) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentMetaService toUML", {
        agentName,
      });
    const subtree = new Set<AgentName>();
    if (!withSubtree) {
      subtree.add(agentName);
    }
    const rootNode = this.makeAgentNode(agentName, subtree);
    return this.serialize([rootNode]);
  };
}

/**
 * Default export of the AgentMetaService class.
 * Provides the primary interface for managing agent metadata and UML generation in the swarm system, integrating with ClientAgent, PerfService, and DocService.
 */
export default AgentMetaService;
