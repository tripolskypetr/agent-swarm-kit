import { inject } from "../../core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../core/types";
import SwarmValidationService from "../validation/SwarmValidationService";
import AgentValidationService from "../validation/AgentValidationService";
import SwarmSchemaService from "../schema/SwarmSchemaService";
import AgentSchemaService from "../schema/AgentSchemaService";
import { ISwarmSchema } from "../../../interfaces/Swarm.interface";
import AgentMetaService from "../meta/AgentMetaService";
import SwarmMetaService from "../meta/SwarmMetaService";
import { GLOBAL_CONFIG } from "../../../config/params";
import { join } from "path";
import { execpool, not, trycatch } from "functools-kit";
import { mkdir, access } from "fs/promises";
import { IAgentSchema } from "../../../interfaces/Agent.interface";
import ToolSchemaService from "../schema/ToolSchemaService";
import StorageSchemaService from "../schema/StorageSchemaService";
import StateSchemaService from "../schema/StateSchemaService";
import PerfService from "./PerfService";
import { getMomentStamp, getTimeStamp } from "get-moment-stamp";
import PolicySchemaService from "../schema/PolicySchemaService";
import { writeFileAtomic } from "../../../utils/writeFileAtomic";
import WikiSchemaService from "../schema/WikiSchemaService";
import MCPSchemaService from "../schema/MCPSchemaService";

/**
 * Maximum number of concurrent threads for documentation generation tasks.
 * Used by execpool in writeSwarmDoc and writeAgentDoc to limit parallel execution, balancing performance and resource usage.
 * @type {number}
 */
const THREAD_POOL_SIZE = 5;
const THREAD_POOL_DELAY = 0;

/**
 * List of subdirectories created for organizing documentation output.
 * Includes "agent" for agent Markdown files and "image" for UML diagrams, used in dumpDocs to structure the output directory.
 * @type {string[]}
 */
const SUBDIR_LIST = ["agent", "image"];

/**
 * Utility function to check if a file or directory exists, wrapped in trycatch for error handling.
 * Returns true if the path is accessible, false otherwise, used in dumpDocs and dumpPerfomance to ensure directories exist before writing.
 * @param {string} filePath - The file or directory path to check.
 * @returns {Promise<boolean>} A promise resolving to true if the path exists, false if access fails.
 */
const exists = trycatch(
  async (filePath: string) => {
    await access(filePath);
    return true;
  },
  { defaultValue: false }
);

/**
 * Service class for generating and writing documentation for swarms, agents, and performance data in the swarm system.
 * Produces Markdown files for swarm (ISwarmSchema) and agent (IAgentSchema) schemas, including UML diagrams via CC_FN_PLANTUML, and JSON files for performance metrics via PerfService.
 * Integrates indirectly with ClientAgent by documenting its schema (e.g., tools, prompts) and performance (e.g., via PerfService), using LoggerService for logging gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
 * Manages concurrent tasks with a thread pool (THREAD_POOL_SIZE) and organizes output in a directory structure (SUBDIR_LIST), enhancing developer understanding of the system.
 */
export class DocService {
  /**
   * Logger service instance for logging documentation generation activities, injected via dependency injection.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used in methods like dumpDocs, writeSwarmDoc, and writeAgentDoc for info-level logging.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Performance service instance for retrieving system and client performance data, injected via DI.
   * Used in dumpPerfomance and dumpClientPerfomance to serialize IPerformanceRecord and IClientPerfomanceRecord data into JSON files.
   * @type {PerfService}
   * @private
   */
  private readonly perfService = inject<PerfService>(TYPES.perfService);

  /**
   * Swarm validation service instance, injected via DI.
   * Provides the list of swarm names for dumpDocs, ensuring only valid swarms are documented.
   * @type {SwarmValidationService}
   * @private
   */
  private readonly swarmValidationService = inject<SwarmValidationService>(
    TYPES.swarmValidationService
  );

  /**
   * Agent validation service instance, injected via DI.
   * Provides the list of agent names for dumpDocs, ensuring only valid agents are documented.
   * @type {AgentValidationService}
   * @private
   */
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  /**
   * Swarm schema service instance, injected via DI.
   * Retrieves ISwarmSchema objects for writeSwarmDoc, supplying swarm details like agents and policies.
   * @type {SwarmSchemaService}
   * @private
   */
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Agent schema service instance, injected via DI.
   * Retrieves IAgentSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.
   * @type {AgentSchemaService}
   * @private
   */
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );

  /**
   * Model context protocol service instance, injected via DI.
   * Retrieves IMCPSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.
   * @type {MCPSchemaService}
   * @private
   */
  private readonly mcpSchemaService = inject<MCPSchemaService>(
    TYPES.mcpSchemaService
  );

  /**
   * Policy schema service instance, injected via DI.
   * Supplies policy descriptions for writeSwarmDoc, documenting banhammer policies associated with swarms.
   * @type {PolicySchemaService}
   * @private
   */
  private readonly policySchemaService = inject<PolicySchemaService>(
    TYPES.policySchemaService
  );

  /**
   * Tool schema service instance, injected via DI.
   * Provides tool details (e.g., function, callbacks) for writeAgentDoc, documenting tools used by agents (e.g., ClientAgent tools).
   * @type {ToolSchemaService}
   * @private
   */
  private readonly toolSchemaService = inject<ToolSchemaService>(
    TYPES.toolSchemaService
  );

  /**
   * Storage schema service instance, injected via DI.
   * Supplies storage details for writeAgentDoc, documenting storage resources used by agents.
   * @type {StorageSchemaService}
   * @private
   */
  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );

  /**
   * Wiki schema service instance, injected via DI.
   * Supplies wiki details for writeAgentDoc, documenting wiki resources used by agents.
   * @type {WikiSchemaService}
   * @private
   */
  private readonly wikiSchemaService = inject<WikiSchemaService>(
    TYPES.wikiSchemaService
  );

  /**
   * State schema service instance, injected via DI.
   * Provides state details for writeAgentDoc, documenting state resources used by agents.
   * @type {StateSchemaService}
   * @private
   */
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * Agent meta service instance, injected via DI.
   * Generates UML diagrams for agents in writeAgentDoc, enhancing documentation with visual schema representations.
   * @type {AgentMetaService}
   * @private
   */
  private readonly agentMetaService = inject<AgentMetaService>(
    TYPES.agentMetaService
  );

  /**
   * Swarm meta service instance, injected via DI.
   * Generates UML diagrams for swarms in writeSwarmDoc, enhancing documentation with visual schema representations.
   * @type {SwarmMetaService}
   * @private
   */
  private readonly swarmMetaService = inject<SwarmMetaService>(
    TYPES.swarmMetaService
  );

  /**
   * Writes Markdown documentation for a swarm schema, detailing its name, description, UML diagram, agents, policies, and callbacks.
   * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[swarmName].md, with UML images in dirName/image, and links to agent docs in dirName/agent, sourced from swarmSchemaService.
   * @param {ISwarmSchema} swarmSchema - The swarm schema to document, including properties like defaultAgent and policies.
   * @param {string} dirName - The base directory for documentation output.
   * @returns {Promise<void>} A promise resolving when the swarm documentation file is written.
   * @private
   */
  private writeSwarmDoc = execpool(
    async (swarmSchema: ISwarmSchema, prefix: string, dirName: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeSwarmDoc", {
          swarmSchema,
        });
      const result: string[] = [];

      {
        result.push("---");
        result.push(`title: ${prefix}/${swarmSchema.swarmName}`);
        result.push(`group: ${prefix}`);
        result.push("---");
        result.push("");
      }

      {
        result.push(`# ${swarmSchema.swarmName}`);
        if (swarmSchema.docDescription) {
          result.push("");
          result.push(`> ${swarmSchema.docDescription}`);
        }
        result.push("");
      }

      {
        const umlSchema = this.swarmMetaService.toUML(swarmSchema.swarmName);
        const umlName = `swarm_schema_${swarmSchema.swarmName}.svg`;
        const umlSvg = await GLOBAL_CONFIG.CC_FN_PLANTUML(umlSchema);
        if (umlSvg) {
          await writeFileAtomic(join(dirName, "image", umlName), umlSvg);
          result.push(`![schema](./image/${umlName})`);
          result.push("");
        }
      }

      if (swarmSchema.defaultAgent) {
        result.push("## Default agent");
        result.push("");
        result.push(
          ` - [${swarmSchema.defaultAgent}](./agent/${swarmSchema.defaultAgent}.md)`
        );
        const { docDescription } = this.agentSchemaService.get(
          swarmSchema.defaultAgent
        );
        if (docDescription) {
          result.push("");
          result.push(`\t${docDescription}`);
        }
        result.push("");
      }

      if (swarmSchema.agentList) {
        result.push(`## Used agents`);
        result.push("");
        for (let i = 0; i !== swarmSchema.agentList.length; i++) {
          if (!swarmSchema.agentList[i]) {
            continue;
          }
          result.push(
            `${i + 1}. [${swarmSchema.agentList[i]}](./agent/${
              swarmSchema.agentList[i]
            }.md)`
          );
          const { docDescription } = this.agentSchemaService.get(
            swarmSchema.agentList[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`\t${docDescription}`);
          }
          result.push("");
        }
      }

      if (swarmSchema.policies) {
        result.push(`## Banhammer policies`);
        result.push("");
        for (let i = 0; i !== swarmSchema.policies.length; i++) {
          if (!swarmSchema.policies[i]) {
            continue;
          }
          result.push(`${i + 1}. ${swarmSchema.policies[i]}`);
          const { docDescription } = this.policySchemaService.get(
            swarmSchema.policies[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`\t${docDescription}`);
          }
          result.push("");
        }
        if (!swarmSchema.policies.length) {
          result.push("");
          result.push(`*Empty policies*`);
        }
      }

      if (swarmSchema.callbacks) {
        result.push(`## Used callbacks`);
        result.push("");
        const callbackList = Object.keys(swarmSchema.callbacks);
        for (let i = 0; i !== callbackList.length; i++) {
          result.push(`${i + 1}. \`${callbackList[i]}\``);
        }
        result.push("");
      }

      await writeFileAtomic(
        join(dirName, `./${swarmSchema.swarmName}.md`),
        result.join("\n")
      );
    },
    {
      maxExec: THREAD_POOL_SIZE,
      delay: THREAD_POOL_DELAY,
    }
  );

  /**
   * Writes Markdown documentation for an agent schema, detailing its name, description, UML diagram, prompts, tools, storages, states, and callbacks.
   * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/agent/[agentName].md, with UML images in dirName/image, sourced from agentSchemaService and related services (e.g., toolSchemaService).
   * @param {IAgentSchema} agentSchema - The agent schema to document, including properties like tools and prompts (e.g., ClientAgent configuration).
   * @param {string} dirName - The base directory for documentation output.
   * @returns {Promise<void>} A promise resolving when the agent documentation file is written.
   * @private
   */
  private writeAgentDoc = execpool(
    async (agentSchema: IAgentSchema, prefix: string, dirName: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeAgentDoc", {
          agentSchema,
        });
      const result: string[] = [];

      {
        result.push("---");
        result.push(`title: ${prefix}/${agentSchema.agentName}`);
        result.push(`group: ${prefix}`);
        result.push("---");
        result.push("");
      }

      {
        result.push(`# ${agentSchema.agentName}`);
        if (agentSchema.docDescription) {
          result.push("");
          result.push(`> ${agentSchema.docDescription}`);
        }
        result.push("");
      }

      if (agentSchema.completion) {
        result.push(`**Completion:** \`${agentSchema.completion}\``);
        result.push("");
      }

      {
        result.push(`*Operator:* [${agentSchema.operator ? "x" : " "}]`);
        result.push("");
      }

      {
        const umlSchema = this.agentMetaService.toUML(
          agentSchema.agentName,
          true
        );
        const umlName = `agent_schema_${agentSchema.agentName}.svg`;
        const umlSvg = await GLOBAL_CONFIG.CC_FN_PLANTUML(umlSchema);
        if (umlSvg) {
          await writeFileAtomic(join(dirName, "image", umlName), umlSvg);
          result.push(`![schema](../image/${umlName})`);
          result.push("");
        }
      }

      if (agentSchema.prompt) {
        result.push(`## Main prompt`);
        result.push("");
        result.push("```");
        result.push(agentSchema.prompt);
        result.push("```");
        result.push("");
      }

      if (agentSchema.systemStatic) {
        result.push(`## System prompt`);
        result.push("");
        for (let i = 0; i !== agentSchema.system.length; i++) {
          if (!agentSchema.system[i]) {
            continue;
          }
          result.push(`${i + 1}. \`${agentSchema.system[i]}\``);
          result.push("");
        }
      }

      if (agentSchema.systemDynamic) {
        result.push("***Dynamic system prompt found***");
        result.push("");
      }

      if (agentSchema.dependsOn) {
        result.push(`## Depends on`);
        result.push("");
        for (let i = 0; i !== agentSchema.dependsOn.length; i++) {
          if (!agentSchema.dependsOn[i]) {
            continue;
          }
          result.push(
            `${i + 1}. [${agentSchema.dependsOn[i]}](./${
              agentSchema.dependsOn[i]
            }.md)`
          );
          const { docDescription } = this.agentSchemaService.get(
            agentSchema.dependsOn[i]
          );
          if (docDescription) {
            result.push("");
            result.push(docDescription);
          }
          result.push("");
        }
      }

      if (agentSchema.mcp) {
        result.push(`## Model Context Protocol`);
        result.push("");
        for (let i = 0; i !== agentSchema.mcp.length; i++) {
          if (!agentSchema.mcp[i]) {
            continue;
          }
          result.push(`${i + 1}. ${agentSchema.mcp[i]}`);
          const { docDescription } = this.mcpSchemaService.get(
            agentSchema.mcp[i]
          );
          if (docDescription) {
            result.push("");
            result.push(docDescription);
          }
          result.push("");
        }
      }

      if (agentSchema.tools) {
        result.push(`## Used tools`);
        result.push("");
        for (let i = 0; i !== agentSchema.tools.length; i++) {
          if (!agentSchema.tools[i]) {
            continue;
          }
          result.push(`### ${i + 1}. ${agentSchema.tools[i]}`);
          const {
            function: fn,
            docNote,
            callbacks,
          } = this.toolSchemaService.get(agentSchema.tools[i]);

          if (fn.name) {
            result.push("");
            result.push("#### Name for model");
            result.push("");
            result.push(`\`${fn.name}\``);
          }

          if (fn.description) {
            result.push("");
            result.push("#### Description for model");
            result.push("");
            result.push(`\`${fn.description}\``);
          }

          if (fn.parameters?.properties) {
            result.push("");
            result.push("#### Parameters for model");
            const entries = Object.entries(fn.parameters.properties);
            entries.forEach(([key, { type, description, enum: e }], idx) => {
              result.push("");
              result.push(`> **${idx + 1}. ${key}**`);
              {
                result.push("");
                result.push(`*Type:* \`${type}\``);
              }
              {
                result.push("");
                result.push(`*Description:* \`${description}\``);
              }
              if (e) {
                result.push("");
                result.push(`*Enum:* \`${e.join(", ")}\``);
              }
              {
                result.push("");
                result.push(
                  `*Required:* [${
                    fn.parameters.required.includes(key) ? "x" : " "
                  }]`
                );
              }
            });
            if (!entries.length) {
              result.push("");
              result.push(`*Empty parameters*`);
            }
          }

          if (callbacks) {
            result.push("");
            result.push(`#### Tool callbacks`);
            result.push("");
            const callbackList = Object.keys(callbacks);
            for (let i = 0; i !== callbackList.length; i++) {
              result.push(`${i + 1}. \`${callbackList[i]}\``);
            }
          }

          if (docNote) {
            result.push("");
            result.push("#### Note for developer");
            result.push("");
            result.push(`*${docNote}*`);
          }

          result.push("");
        }
      }

      if (agentSchema.storages) {
        result.push(`## Used storages`);
        result.push("");
        for (let i = 0; i !== agentSchema.storages.length; i++) {
          if (!agentSchema.storages[i]) {
            continue;
          }
          result.push(`### ${i + 1}. ${agentSchema.storages[i]}`);
          const { docDescription, embedding, shared, callbacks } =
            this.storageSchemaService.get(agentSchema.storages[i]);
          if (docDescription) {
            result.push("");
            result.push(`#### Storage description`);
            result.push("");
            result.push(docDescription);
          }
          if (embedding) {
            result.push("");
            result.push(`*Embedding:* \`${embedding}\``);
          }
          {
            result.push("");
            result.push(`*Shared:* [${shared ? "x" : " "}]`);
          }
          if (callbacks) {
            result.push("");
            result.push(`#### Storage callbacks`);
            result.push("");
            const callbackList = Object.keys(callbacks);
            for (let i = 0; i !== callbackList.length; i++) {
              result.push(`${i + 1}. \`${callbackList[i]}\``);
            }
          }
          result.push("");
        }
      }

      if (agentSchema.states) {
        result.push(`## Used states`);
        result.push("");
        for (let i = 0; i !== agentSchema.states.length; i++) {
          if (!agentSchema.states[i]) {
            continue;
          }
          result.push(`### ${i + 1}. ${agentSchema.states[i]}`);
          const { docDescription, shared, callbacks } =
            this.stateSchemaService.get(agentSchema.states[i]);
          if (docDescription) {
            result.push("");
            result.push(`#### State description`);
            result.push("");
            result.push(docDescription);
          }
          {
            result.push("");
            result.push(`**Shared:** [${shared ? "x" : " "}]`);
          }
          if (callbacks) {
            result.push("");
            result.push(`#### State callbacks`);
            result.push("");
            const callbackList = Object.keys(callbacks);
            for (let i = 0; i !== callbackList.length; i++) {
              result.push(`${i + 1}. \`${callbackList[i]}\``);
            }
          }
          result.push("");
        }
      }

      if (agentSchema.wikiList) {
        result.push(`## Used wiki list`);
        result.push("");
        for (let i = 0; i !== agentSchema.wikiList.length; i++) {
          if (!agentSchema.wikiList[i]) {
            continue;
          }
          result.push(`### ${i + 1}. ${agentSchema.wikiList[i]}`);
          const { docDescription, callbacks } = this.wikiSchemaService.get(
            agentSchema.wikiList[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`#### Wiki description`);
            result.push("");
            result.push(docDescription);
          }
          if (callbacks) {
            result.push("");
            result.push(`#### Wiki callbacks`);
            result.push("");
            const callbackList = Object.keys(callbacks);
            for (let i = 0; i !== callbackList.length; i++) {
              result.push(`${i + 1}. \`${callbackList[i]}\``);
            }
          }
          result.push("");
        }
      }

      if (agentSchema.callbacks) {
        result.push(`## Used callbacks`);
        result.push("");
        const callbackList = Object.keys(agentSchema.callbacks);
        for (let i = 0; i !== callbackList.length; i++) {
          result.push(`${i + 1}. \`${callbackList[i]}\``);
        }
        result.push("");
      }

      await writeFileAtomic(
        join(dirName, `./agent/${agentSchema.agentName}.md`),
        result.join("\n")
      );
    },
    {
      maxExec: THREAD_POOL_SIZE,
      delay: THREAD_POOL_DELAY,
    }
  );

  /**
   * Generates and writes documentation for all swarms and agents in the system.
   * Creates subdirectories (SUBDIR_LIST), then concurrently writes swarm and agent docs using writeSwarmDoc and writeAgentDoc, logging progress if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to a directory structure rooted at dirName (default: "docs/chat"), integrating with ClientAgent by documenting its schema.
   * @param {string} [dirName=join(process.cwd(), "docs/chat")] - The base directory for documentation output, defaults to "docs/chat" in the current working directory.
   * @returns {Promise<void>} A promise resolving when all documentation files are written.
   */
  public dumpDocs = async (
    prefix = "swarm",
    dirName = join(process.cwd(), "docs/chat")
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs", {
        dirName,
      });
    for (const subDir of SUBDIR_LIST) {
      const path = join(dirName, subDir);
      if (await not(exists(path))) {
        await mkdir(path, { recursive: true });
      }
    }
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building swarm docs");
    await Promise.all(
      this.swarmValidationService.getSwarmList().map(async (swarmName) => {
        const swarmSchema = this.swarmSchemaService.get(swarmName);
        await this.writeSwarmDoc(swarmSchema, prefix, dirName);
      })
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building agent docs");
    await Promise.all(
      this.agentValidationService.getAgentList().map(async (agentName) => {
        const agentSchema = this.agentSchemaService.get(agentName);
        await this.writeAgentDoc(agentSchema, prefix, dirName);
      })
    );
  };

  /**
   * Dumps system-wide performance data to a JSON file using PerfService.toRecord.
   * Ensures the output directory exists, then writes a timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[momentStamp].[timeStamp].json (default: "logs/meta"), providing a snapshot of system performance (e.g., tied to ClientAgent executions).
   * @param {string} [dirName=join(process.cwd(), "logs/meta")] - The directory for performance data output, defaults to "logs/meta" in the current working directory.
   * @returns {Promise<void>} A promise resolving when the performance data file is written.
   */
  public dumpPerfomance = async (
    dirName = join(process.cwd(), "logs/meta")
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpPerfomance", {
        dirName,
      });
    if (await not(exists(dirName))) {
      await mkdir(dirName, { recursive: true });
    }
    await writeFileAtomic(
      join(dirName, `${getMomentStamp()}.${getTimeStamp()}.json`),
      JSON.stringify(await this.perfService.toRecord())
    );
  };

  /**
   * Dumps performance data for a specific client to a JSON file using PerfService.toClientRecord.
   * Ensures the output directory exists, then writes a client-specific timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[clientId].[momentStamp].json (default: "logs/client"), documenting client-specific metrics (e.g., ClientAgent session performance).
   * @param {string} clientId - The unique identifier of the client session to document.
   * @param {string} [dirName=join(process.cwd(), "logs/client")] - The directory for client performance data output, defaults to "logs/client" in the current working directory.
   * @returns {Promise<void>} A promise resolving when the client performance data file is written.
   */
  public dumpClientPerfomance = async (
    clientId: string,
    dirName = join(process.cwd(), "logs/client")
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpPerfomance", {
        dirName,
      });
    if (await not(exists(dirName))) {
      await mkdir(dirName, { recursive: true });
    }
    await writeFileAtomic(
      join(dirName, `${clientId}.${getMomentStamp()}.json`),
      JSON.stringify(await this.perfService.toClientRecord(clientId))
    );
  };
}

/**
 * Default export of the DocService class.
 * Provides the primary interface for generating documentation and performance dumps in the swarm system.
 * @type {typeof DocService}
 */
export default DocService;
