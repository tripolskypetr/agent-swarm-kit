import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { AgentName } from "../../../interfaces/Agent.interface";
import AgentSchemaService from "../schema/AgentSchemaService";

const MAX_NESTING = 10;
const UML_STEP = "\t";
const UML_BULLET = "[*]";
const UML_TRIANGLE = "[>]";

/**
 * Interface representing a meta node.
 */
export interface IMetaNode {
  name: string;
  child?: IMetaNode[];
}

/**
 * Creates a function to serialize meta nodes to UML format.
 * @returns {Function} A function that takes an array of IMetaNode and returns a string in UML format.
 */
export const createSerialize = () => (nodes: IMetaNode[]) => {
  const lines: string[] = [];

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
 * Service class for managing agent meta nodes and converting them to UML format.
 */
export class AgentMetaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );
  private serialize = createSerialize();

  /**
   * Creates a meta node for the given agent.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {IMetaNode} The created meta node.
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
   * Creates a meta node for the given agent.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {IMetaNode} The created meta node.
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
   * Converts the meta nodes of the given agent to UML format.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {string} The UML representation of the agent's meta nodes.
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

export default AgentMetaService;
