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
import { IAgentSchemaInternal } from "../../../interfaces/Agent.interface";
import ToolSchemaService from "../schema/ToolSchemaService";
import StorageSchemaService from "../schema/StorageSchemaService";
import StateSchemaService from "../schema/StateSchemaService";
import PerfService from "./PerfService";
import { getMomentStamp, getTimeStamp } from "get-moment-stamp";
import PolicySchemaService from "../schema/PolicySchemaService";
import { writeFileAtomic } from "../../../utils/writeFileAtomic";
import WikiSchemaService from "../schema/WikiSchemaService";
import MCPSchemaService from "../schema/MCPSchemaService";
import ComputeValidationService from "../validation/ComputeValidationService";
import ComputeSchemaService from "../schema/ComputeSchemaService";
import OutlineValidationService from "../validation/OutlineValidationService";
import OutlineSchemaService from "../schema/OutlineSchemaService";
import {
  IOutlineObjectFormat,
  IOutlineSchema,
  IOutlineSchemaFormat,
} from "../../../interfaces/Outline.interface";
import CompletionSchemaService from "../schema/CompletionSchemaService";

/**
 * Maximum number of concurrent threads for documentation generation tasks.
 * Used by execpool in writeSwarmDoc and writeAgentDoc to limit parallel execution, balancing performance and resource usage.
 */
const THREAD_POOL_SIZE = 5;
const THREAD_POOL_DELAY = 0;

/**
 * List of subdirectories created for organizing documentation output.
 * Includes "agent" for agent Markdown files and "image" for UML diagrams, used in dumpDocs to structure the output directory.
 */
const SUBDIR_LIST = ["agent", "image", "outline"];

/**
 * Utility function to check if a file or directory exists, wrapped in trycatch for error handling.
 * Returns true if the path is accessible, false otherwise, used in dumpDocs and dumpPerfomance to ensure directories exist before writing.
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
 * Produces Markdown files for swarm (ISwarmSchema) and agent (IAgentSchemaInternal) schemas, including UML diagrams via CC_FN_PLANTUML, and JSON files for performance metrics via PerfService.
 * Integrates indirectly with ClientAgent by documenting its schema (e.g., tools, prompts) and performance (e.g., via PerfService), using LoggerService for logging gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
 * Manages concurrent tasks with a thread pool (THREAD_POOL_SIZE) and organizes output in a directory structure (SUBDIR_LIST), enhancing developer understanding of the system.
 */
export class DocService {
  /**
   * Logger service instance for logging documentation generation activities, injected via dependency injection.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used in methods like dumpDocs, writeSwarmDoc, and writeAgentDoc for info-level logging.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Performance service instance for retrieving system and client performance data, injected via DI.
   * Used in dumpPerfomance and dumpClientPerfomance to serialize IPerformanceRecord and IClientPerfomanceRecord data into JSON files.
   * @private
   */
  private readonly perfService = inject<PerfService>(TYPES.perfService);

  /**
   * Swarm validation service instance, injected via DI.
   * Provides the list of swarm names for dumpDocs, ensuring only valid swarms are documented.
   * @private
   */
  private readonly swarmValidationService = inject<SwarmValidationService>(
    TYPES.swarmValidationService
  );

  /**
   * Agent validation service instance, injected via DI.
   * Provides the list of agent names for dumpDocs, ensuring only valid agents are documented.
   * @private
   */
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  /**
   * Outline validation service instance, injected via DI.
   * Used for validating and managing agent outline schemas, ensuring agent outlines conform to expected structure and constraints.
   * @private
   */
  private readonly outlineValidationService = inject<OutlineValidationService>(
    TYPES.outlineValidationService
  );

  /**
   * Swarm schema service instance, injected via DI.
   * Retrieves ISwarmSchema objects for writeSwarmDoc, supplying swarm details like agents and policies.
   * @private
   */
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );

  /**
   * Agent schema service instance, injected via DI.
   * Retrieves IAgentSchemaInternal objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.
   * @private
   */
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );

  /**
   * Outline schema service instance, injected via DI.
   * Retrieves and manages outline schema objects for agents, supporting documentation and validation of agent outlines.
   * @private
   */
  private readonly outlineSchemaService = inject<OutlineSchemaService>(
    TYPES.outlineSchemaService
  );

  /**
   * Model context protocol service instance, injected via DI.
   * Retrieves IMCPSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.
   * @private
   */
  private readonly mcpSchemaService = inject<MCPSchemaService>(
    TYPES.mcpSchemaService
  );

  /**
   * Policy schema service instance, injected via DI.
   * Supplies policy descriptions for writeSwarmDoc, documenting banhammer policies associated with swarms.
   * @private
   */
  private readonly policySchemaService = inject<PolicySchemaService>(
    TYPES.policySchemaService
  );

  /**
   * Tool schema service instance, injected via DI.
   * Provides tool details (e.g., function, callbacks) for writeAgentDoc, documenting tools used by agents (e.g., ClientAgent tools).
   * @private
   */
  private readonly toolSchemaService = inject<ToolSchemaService>(
    TYPES.toolSchemaService
  );

  /**
   * Storage schema service instance, injected via DI.
   * Supplies storage details for writeAgentDoc, documenting storage resources used by agents.
   * @private
   */
  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );

  /**
   * Wiki schema service instance, injected via DI.
   * Supplies wiki details for writeAgentDoc, documenting wiki resources used by agents.
   * @private
   */
  private readonly wikiSchemaService = inject<WikiSchemaService>(
    TYPES.wikiSchemaService
  );

  /**
   * State schema service instance, injected via DI.
   * Provides state details for writeAgentDoc, documenting state resources used by agents.
   * @private
   */
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * Completion schema service instance, injected via DI.
   * Provides completion details for writeAgentDoc, documenting completion resources used by agents.
   * @private
   */
  private readonly completionSchemaService = inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  );

  /**
   * Compute schema service instance, injected via DI.
   * Provides compute details for writeAgentDoc, documenting compute resources used by agents.
   * @private
   */
  private readonly computeSchemaService = inject<ComputeSchemaService>(
    TYPES.computeSchemaService
  );

  /**
   * Compute validation service instance, injected via DI.
   * Provides compute list for writeAgentDoc, documenting compute resources used by states in agents.
   * @private
   */
  private readonly computeValidationService = inject<ComputeValidationService>(
    TYPES.computeValidationService
  );

  /**
   * Agent meta service instance, injected via DI.
   * Generates UML diagrams for agents in writeAgentDoc, enhancing documentation with visual schema representations.
   * @private
   */
  private readonly agentMetaService = inject<AgentMetaService>(
    TYPES.agentMetaService
  );

  /**
   * Swarm meta service instance, injected via DI.
   * Generates UML diagrams for swarms in writeSwarmDoc, enhancing documentation with visual schema representations.
   * @private
   */
  private readonly swarmMetaService = inject<SwarmMetaService>(
    TYPES.swarmMetaService
  );

  /**
   * Writes Markdown documentation for a swarm schema, detailing its name, description, UML diagram, agents, policies, and callbacks.
   * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[swarmName].md, with UML images in dirName/image, and links to agent docs in dirName/agent, sourced from swarmSchemaService.
   * @private
   */
  private writeSwarmDoc = execpool(
    async (
      swarmSchema: ISwarmSchema,
      prefix: string,
      dirName: string,
      sanitizeMarkdown: (text: string) => string = (t) => t
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeSwarmDoc", {
          swarmSchema,
        });
      const result: string[] = [];

      {
        result.push("---");
        result.push(
          `title: ${prefix}/${sanitizeMarkdown(swarmSchema.swarmName)}`
        );
        result.push(`group: ${prefix}`);
        result.push("---");
        result.push("");
      }

      {
        result.push(`# ${sanitizeMarkdown(swarmSchema.swarmName)}`);
        if (swarmSchema.docDescription) {
          result.push("");
          result.push(`> ${sanitizeMarkdown(swarmSchema.docDescription)}`);
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
          ` - [${sanitizeMarkdown(swarmSchema.defaultAgent)}](./agent/${swarmSchema.defaultAgent
          }.md)`
        );
        const { docDescription } = this.agentSchemaService.get(
          swarmSchema.defaultAgent
        );
        if (docDescription) {
          result.push("");
          result.push(`\t${sanitizeMarkdown(docDescription)}`);
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
            `${i + 1}. [${sanitizeMarkdown(
              swarmSchema.agentList[i]
            )}](./agent/${swarmSchema.agentList[i]}.md)`
          );
          const { docDescription } = this.agentSchemaService.get(
            swarmSchema.agentList[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`\t${sanitizeMarkdown(docDescription)}`);
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
          result.push(`${i + 1}. ${sanitizeMarkdown(swarmSchema.policies[i])}`);
          const { docDescription } = this.policySchemaService.get(
            swarmSchema.policies[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`\t${sanitizeMarkdown(docDescription)}`);
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
          result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
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
   * Writes Markdown documentation for an outline schema, detailing its name, description, main prompt, output format, and callbacks.
   * Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[outlineName].md, sourced from outlineSchemaService.
   *
   * - The Markdown includes YAML frontmatter, outline name, description, prompt(s), output format (with types, descriptions, enums, and required fields), and callbacks.
   * - Handles both string and function-based prompts, and supports array or string prompt types.
   * - Output format section documents each property, its type, description, enum values, and required status.
   * - Callback section lists all callback names used by the outline.
   *
   * @private
   */
  private writeOutlineDoc = execpool(
    async (
      outlineSchema: IOutlineSchema,
      prefix: string,
      dirName: string,
      sanitizeMarkdown: (text: string) => string = (t) => t
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeOutlineDoc", {
          outlineSchema,
        });
      const result: string[] = [];

      {
        result.push("---");
        result.push(
          `title: ${prefix}/${sanitizeMarkdown(outlineSchema.outlineName)}`
        );
        result.push(`group: ${prefix}`);
        result.push("---");
        result.push("");
      }

      {
        result.push(`# ${sanitizeMarkdown(outlineSchema.outlineName)}`);
        if (outlineSchema.docDescription) {
          result.push("");
          result.push(`> ${sanitizeMarkdown(outlineSchema.docDescription)}`);
        }
        result.push("");
      }

      if (outlineSchema.completion) {
        result.push(
          `**Completion:** \`${sanitizeMarkdown(outlineSchema.completion)}\``
        );
        result.push("");
      }


      if (outlineSchema.completion) {
        const { flags = [] } = this.completionSchemaService.get(
          outlineSchema.completion
        );

        if (flags.length) {
          result.push(`## Completion flags`);
          result.push("");
          for (let i = 0; i !== flags.length; i++) {
            if (!flags[i]) {
              continue;
            }
            result.push(`${i + 1}. \`${sanitizeMarkdown(flags[i])}\``);
            result.push("");
          }
        }

        result.push("");
      }

      const getPrompt = async () => {
        try {
          if (typeof outlineSchema.prompt === "string") {
            return outlineSchema.prompt;
          }
          if (typeof outlineSchema.prompt === "function") {
            return await outlineSchema.prompt(outlineSchema.outlineName);
          }
          return null;
        } catch (error) {
          console.error(`Error while resolving outline prompt outlineName=${outlineSchema.outlineName}`, error);
          return null;
        }
      };

      const prompt = await getPrompt();

      if (typeof prompt === "string") {
        result.push(`## Main prompt`);
        result.push("");
        result.push("```");
        result.push(sanitizeMarkdown(prompt));
        result.push("```");
        result.push("");
      }

      const getSystem = async () => {
        try {
          if (typeof outlineSchema.system === "function") {
            return await outlineSchema.system(outlineSchema.outlineName);
          }
          return outlineSchema.system;
        } catch (error) {
          console.error(`Error while resolving outline system prompt outlineName=${outlineSchema.outlineName}`, error);
          return null;
        }
      };

      const system = await getSystem();

      if (system) {
        result.push(`## System prompt`);
        result.push("");
        for (let i = 0; i !== system.length; i++) {
          if (!system[i]) {
            continue;
          }
          result.push(`${i + 1}. \`${sanitizeMarkdown(system[i])}\``);
          result.push("");
        }
      }

      const writeObjectFormat = (
        object: IOutlineObjectFormat,
        strict: boolean
      ) => {
        if ("properties" in object) {
          result.push("");
          result.push("## Output format");
          result.push("");
          result.push(
            strict ? "*Strict template match*" : "*Partial template match*"
          );
          const entries = Object.entries(object.properties);
          entries.forEach(([key, { type, description, enum: e }], idx) => {
            result.push("");
            result.push(`> **${idx + 1}. ${sanitizeMarkdown(key)}**`);
            {
              result.push("");
              result.push(`*Type:* \`${sanitizeMarkdown(type)}\``);
            }
            {
              result.push("");
              result.push(
                `*Description:* \`${sanitizeMarkdown(description)}\``
              );
            }
            if (e) {
              result.push("");
              result.push(`*Enum:* \`${e.map(sanitizeMarkdown).join(", ")}\``);
            }
            if ("required" in object) {
              result.push("");
              result.push(
                `*Required:* [${object.required.includes(key) ? "x" : " "}]`
              );
            }
          });
          if (!entries.length) {
            result.push("");
            result.push(`*Empty parameters*`);
          }
          result.push("");
        }
      };

      const writeStrictFormat = (schema: IOutlineSchemaFormat) => {
        if (schema?.type === "json_schema") {
          result.push("");
          result.push("## Output format");
          result.push("");
          result.push("*Strict template match*");
          result.push("");
          result.push("```json");
          result.push(JSON.stringify(schema, null, 2));
          result.push("```");
          result.push("");
        }
      };

      const writeFormat = () => {
        let object: any = outlineSchema.format;
        if (object?.json_schema?.schema?.type === "object") {
          writeObjectFormat(object.json_schema.schema, true);
          return;
        }
        if (object.properties) {
          writeObjectFormat(object, false);
          return;
        }
        writeStrictFormat(object);
      };

      writeFormat();

      const getValidations = () => {
        if (outlineSchema.validations) {
          return outlineSchema.validations
            .filter((validation) => typeof validation === "object")
            .filter((validation) => !!validation.docDescription);
        }
        return [];
      };

      const validations = getValidations();

      if (validations.length) {
        result.push(`## Validations`);
        result.push("");
        for (let i = 0; i !== validations.length; i++) {
          if (!validations[i].docDescription) {
            continue;
          }
          result.push(
            `${i + 1}. \`${sanitizeMarkdown(validations[i].docDescription)}\``
          );
          result.push("");
        }
      }

      if (outlineSchema.callbacks) {
        result.push(`## Used callbacks`);
        result.push("");
        const callbackList = Object.keys(outlineSchema.callbacks);
        for (let i = 0; i !== callbackList.length; i++) {
          result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
        }
        result.push("");
      }

      await writeFileAtomic(
        join(dirName, `./outline/${outlineSchema.outlineName}.md`),
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
   * @private
   */
  private writeAgentDoc = execpool(
    async (
      agentSchema: IAgentSchemaInternal,
      prefix: string,
      dirName: string,
      sanitizeMarkdown: (text: string) => string = (t) => t
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeAgentDoc", {
          agentSchema,
        });
      const result: string[] = [];

      {
        result.push("---");
        result.push(
          `title: ${prefix}/${sanitizeMarkdown(agentSchema.agentName)}`
        );
        result.push(`group: ${prefix}`);
        result.push("---");
        result.push("");
      }

      {
        result.push(`# ${sanitizeMarkdown(agentSchema.agentName)}`);
        if (agentSchema.docDescription) {
          result.push("");
          result.push(`> ${sanitizeMarkdown(agentSchema.docDescription)}`);
        }
        result.push("");
      }

      if (agentSchema.completion) {
        result.push(
          `**Completion:** \`${sanitizeMarkdown(agentSchema.completion)}\``
        );

        result.push("");
      }

      {
        result.push(`*Operator:* [${agentSchema.operator ? "x" : " "}]`);
        result.push("");
      }

      if (agentSchema.completion) {
        const { flags = [] } = this.completionSchemaService.get(
          agentSchema.completion
        );

        if (flags.length) {
          result.push(`## Completion flags`);
          result.push("");
          for (let i = 0; i !== flags.length; i++) {
            if (!flags[i]) {
              continue;
            }
            result.push(`${i + 1}. \`${sanitizeMarkdown(flags[i])}\``);
            result.push("");
          }
        }

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

      const getPrompt = async () => {
        try {
          if (typeof agentSchema.prompt === "string") {
            return agentSchema.prompt;
          }
          if (typeof agentSchema.prompt === "function") {
            return await agentSchema.prompt("docs", agentSchema.agentName);
          }
          return null;
        } catch (error) {
          console.error(`Error while resolving agent prompt agentName=${agentSchema.agentName}`, error);
          return null;
        }
      };

      const prompt = await getPrompt();

      if (prompt) {
        result.push(`## Main prompt`);
        result.push("");
        result.push("```");
        result.push(sanitizeMarkdown(prompt));
        result.push("```");
        result.push("");
      }

      const getSystem = async () => {
        let system: string[] = [];
        try {
          if (agentSchema.systemStatic) {
            system = system.concat(agentSchema.systemStatic);
          }
          if (agentSchema.system) {
            system = system.concat(agentSchema.system);
          }
          if (agentSchema.systemDynamic) {
            system = system.concat(
              await agentSchema.systemDynamic("docs", agentSchema.agentName)
            );
          }
        } catch (error) {
          console.error(`Error while resolving agent system prompt agentName=${agentSchema.agentName}`, error);
        } finally {
          return system;
        }
      };

      const system = await getSystem();

      if (system.length) {
        result.push(`## System prompt`);
        result.push("");
        for (let i = 0; i !== system.length; i++) {
          if (!system[i]) {
            continue;
          }
          result.push(`${i + 1}. \`${sanitizeMarkdown(system[i])}\``);
          result.push("");
        }
      }

      if (agentSchema.dependsOn) {
        result.push(`## Depends on`);
        result.push("");
        for (let i = 0; i !== agentSchema.dependsOn.length; i++) {
          if (!agentSchema.dependsOn[i]) {
            continue;
          }
          result.push(
            `${i + 1}. [${sanitizeMarkdown(agentSchema.dependsOn[i])}](./${agentSchema.dependsOn[i]
            }.md)`
          );
          const { docDescription } = this.agentSchemaService.get(
            agentSchema.dependsOn[i]
          );
          if (docDescription) {
            result.push("");
            result.push(sanitizeMarkdown(docDescription));
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
          result.push(`${i + 1}. ${sanitizeMarkdown(agentSchema.mcp[i])}`);
          const { docDescription } = this.mcpSchemaService.get(
            agentSchema.mcp[i]
          );
          if (docDescription) {
            result.push("");
            result.push(sanitizeMarkdown(docDescription));
          }
          result.push("");
        }
      }

      const getTools = async () => {
        try {
          if (!agentSchema.tools) {
            return null;
          }
          return await Promise.all(
            agentSchema.tools
              .map((toolName) => this.toolSchemaService.get(toolName))
              .map(async (tool) => {
                const { function: upperFn, ...other } = tool;
                const fn =
                  typeof upperFn === "function"
                    ? await upperFn("docs", agentSchema.agentName)
                    : upperFn;
                return {
                  ...other,
                  function: fn,
                };
              })
          );
        } catch (error) {
          console.error(`Error while resolving agent tools agentName=${agentSchema.agentName}`, error);
          return null;
        }
      };

      const tools = await getTools();

      if (tools) {
        result.push(`## Used tools`);
        result.push("");
        for (let i = 0; i !== tools.length; i++) {
          if (!tools[i]) {
            continue;
          }
          const { function: fn, docNote, callbacks } = tools[i];

          result.push(
            `### ${i + 1}. ${sanitizeMarkdown(agentSchema.tools[i])}`
          );

          if (fn.name) {
            result.push("");
            result.push("#### Name for model");
            result.push("");
            result.push(`\`${sanitizeMarkdown(fn.name)}\``);
          }

          if (fn.description) {
            result.push("");
            result.push("#### Description for model");
            result.push("");
            result.push(`\`${sanitizeMarkdown(fn.description)}\``);
          }

          if (fn.parameters?.properties) {
            result.push("");
            result.push("#### Parameters for model");
            const entries = Object.entries(fn.parameters.properties);
            entries.forEach(([key, { type, description, enum: e }], idx) => {
              result.push("");
              result.push(`> **${idx + 1}. ${sanitizeMarkdown(key)}**`);
              {
                result.push("");
                result.push(`*Type:* \`${sanitizeMarkdown(type)}\``);
              }
              {
                result.push("");
                result.push(
                  `*Description:* \`${sanitizeMarkdown(description)}\``
                );
              }
              if (e) {
                result.push("");
                result.push(
                  `*Enum:* \`${e.map(sanitizeMarkdown).join(", ")}\``
                );
              }
              {
                result.push("");
                result.push(
                  `*Required:* [${fn.parameters.required.includes(key) ? "x" : " "
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
              result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
            }
          }

          if (docNote) {
            result.push("");
            result.push("#### Note for developer");
            result.push("");
            result.push(`*${sanitizeMarkdown(docNote)}*`);
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
          result.push(
            `### ${i + 1}. ${sanitizeMarkdown(agentSchema.storages[i])}`
          );
          const { docDescription, embedding, shared, callbacks } =
            this.storageSchemaService.get(agentSchema.storages[i]);
          if (docDescription) {
            result.push("");
            result.push(`#### Storage description`);
            result.push("");
            result.push(sanitizeMarkdown(docDescription));
          }
          if (embedding) {
            result.push("");
            result.push(`*Embedding:* \`${sanitizeMarkdown(embedding)}\``);
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
              result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
            }
          }
          result.push("");
        }
      }

      const computeSchemasTotalList = this.computeValidationService
        .getComputeList()
        .flatMap((computeName) => {
          const schema = this.computeSchemaService.get(computeName);
          if (schema.dependsOn) {
            return schema.dependsOn.map((stateName) => {
              return [stateName, schema] as const;
            });
          }
          return [];
        });

      if (agentSchema.states) {
        result.push(`## Used states`);
        result.push("");
        for (let i = 0; i !== agentSchema.states.length; i++) {
          if (!agentSchema.states[i]) {
            continue;
          }
          result.push(
            `### ${i + 1}. ${sanitizeMarkdown(agentSchema.states[i])}`
          );
          const { docDescription, shared, callbacks } =
            this.stateSchemaService.get(agentSchema.states[i]);
          if (docDescription) {
            result.push("");
            result.push(`#### State description`);
            result.push("");
            result.push(sanitizeMarkdown(docDescription));
          }
          {
            const computeSchemasCurrentList = computeSchemasTotalList.filter(
              ([stateName]) => stateName === agentSchema.states[i]
            );
            if (computeSchemasCurrentList?.length) {
              result.push("");
              result.push(`#### State bindings`);
              result.push("");
              for (let i = 0; i !== computeSchemasCurrentList.length; i++) {
                const [, { computeName, docDescription }] =
                  computeSchemasCurrentList[i];
                result.push("");
                result.push(`> **${i + 1}. ${sanitizeMarkdown(computeName)}**`);
                {
                  result.push("");
                  result.push(
                    `*Description:* \`${sanitizeMarkdown(docDescription)}\``
                  );
                }
              }
              result.push("");
            }
          }
          {
            if (callbacks) {
              result.push("");
              result.push(`#### State callbacks`);
              result.push("");
              const callbackList = Object.keys(callbacks);
              for (let i = 0; i !== callbackList.length; i++) {
                result.push(
                  `${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``
                );
              }
            }
          }
          {
            result.push("");
            result.push(`**Shared:** [${shared ? "x" : " "}]`);
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
          result.push(
            `### ${i + 1}. ${sanitizeMarkdown(agentSchema.wikiList[i])}`
          );
          const { docDescription, callbacks } = this.wikiSchemaService.get(
            agentSchema.wikiList[i]
          );
          if (docDescription) {
            result.push("");
            result.push(`#### Wiki description`);
            result.push("");
            result.push(sanitizeMarkdown(docDescription));
          }
          if (callbacks) {
            result.push("");
            result.push(`#### Wiki callbacks`);
            result.push("");
            const callbackList = Object.keys(callbacks);
            for (let i = 0; i !== callbackList.length; i++) {
              result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
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
          result.push(`${i + 1}. \`${sanitizeMarkdown(callbackList[i])}\``);
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
   */
  public dumpDocs = async (
    prefix = "swarm",
    dirName = join(process.cwd(), "docs/chat"),
    sanitizeMarkdown = (text: string) => text
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
        await this.writeSwarmDoc(
          swarmSchema,
          prefix,
          dirName,
          sanitizeMarkdown
        );
      })
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building agent docs");
    await Promise.all(
      this.agentValidationService.getAgentList().map(async (agentName) => {
        const agentSchema = this.agentSchemaService.get(agentName);
        await this.writeAgentDoc(
          agentSchema,
          prefix,
          dirName,
          sanitizeMarkdown
        );
      })
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building outline docs");
    await Promise.all(
      this.outlineValidationService
        .getOutlineList()
        .map(async (outlineName) => {
          const outlineSchema = this.outlineSchemaService.get(outlineName);
          await this.writeOutlineDoc(
            outlineSchema,
            prefix,
            dirName,
            sanitizeMarkdown
          );
        })
    );
  };

  /**
   * Dumps system-wide performance data to a JSON file using PerfService.toRecord.
   * Ensures the output directory exists, then writes a timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
   * Outputs to dirName/[momentStamp].[timeStamp].json (default: "logs/meta"), providing a snapshot of system performance (e.g., tied to ClientAgent executions).
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
 */
export default DocService;
