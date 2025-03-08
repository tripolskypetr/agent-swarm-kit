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
import { execpool } from "functools-kit";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { IAgentSchema } from "../../../interfaces/Agent.interface";
import ToolSchemaService from "../schema/ToolSchemaService";
import StorageSchemaService from "../schema/StorageSchemaService";
import StateSchemaService from "../schema/StateSchemaService";
import PerfService from "./PerfService";

const THREAD_POOL_SIZE = 5;

const SUBDIR_LIST = ["agent", "image"];

/**
 * Service for generating documentation for swarms and agents.
 * @class
 */
export class DocService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly perfService = inject<PerfService>(TYPES.perfService);
  private readonly swarmValidationService = inject<SwarmValidationService>(
    TYPES.swarmValidationService
  );
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );
  private readonly swarmSchemaService = inject<SwarmSchemaService>(
    TYPES.swarmSchemaService
  );
  private readonly agentSchemaService = inject<AgentSchemaService>(
    TYPES.agentSchemaService
  );
  private readonly toolSchemaService = inject<ToolSchemaService>(
    TYPES.toolSchemaService
  );
  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  private readonly agentMetaService = inject<AgentMetaService>(
    TYPES.agentMetaService
  );
  private readonly swarmMetaService = inject<SwarmMetaService>(
    TYPES.swarmMetaService
  );

  /**
   * Writes documentation for a swarm schema.
   * @param {ISwarmSchema} swarmSchema - The swarm schema to document.
   * @param {string} dirName - The directory to write the documentation to.
   * @returns {Promise<void>}
   */
  private writeSwarmDoc = execpool(
    async (swarmSchema: ISwarmSchema, dirName: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeSwarmDoc", {
          swarmSchema,
        });
      const result: string[] = [];

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
          writeFileSync(join(dirName, "image", umlName), umlSvg);
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

      if (swarmSchema.callbacks) {
        result.push(`## Used callbacks`);
        result.push("");
        const callbackList = Object.keys(swarmSchema.callbacks);
        for (let i = 0; i !== callbackList.length; i++) {
          result.push(`${i + 1}. \`${callbackList[i]}\``);
        }
        result.push("");
      }

      writeFileSync(
        join(dirName, `./${swarmSchema.swarmName}.md`),
        result.join("\n")
      );
    },
    {
      maxExec: THREAD_POOL_SIZE,
    }
  );

  /**
   * Writes documentation for an agent schema.
   * @param {IAgentSchema} agentSchema - The agent schema to document.
   * @param {string} dirName - The directory to write the documentation to.
   * @returns {Promise<void>}
   */
  private writeAgentDoc = execpool(
    async (agentSchema: IAgentSchema, dirName: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("docService writeAgentDoc", {
          agentSchema,
        });
      const result: string[] = [];

      {
        result.push(`# ${agentSchema.agentName}`);
        if (agentSchema.docDescription) {
          result.push("");
          result.push(`> ${agentSchema.docDescription}`);
        }
        result.push("");
      }

      {
        result.push(`**Completion:** \`${agentSchema.completion}\``);
        result.push("");
      }

      {
        const umlSchema = this.agentMetaService.toUML(agentSchema.agentName, true);
        const umlName = `agent_schema_${agentSchema.agentName}.svg`;
        const umlSvg = await GLOBAL_CONFIG.CC_FN_PLANTUML(umlSchema);
        if (umlSvg) {
          writeFileSync(join(dirName, "image", umlName), umlSvg);
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

      if (agentSchema.system) {
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
            entries.forEach(
              ([key, { type, description, enum: e }], idx) => {
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
              }
            );
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

      if (agentSchema.callbacks) {
        result.push(`## Used callbacks`);
        result.push("");
        const callbackList = Object.keys(agentSchema.callbacks);
        for (let i = 0; i !== callbackList.length; i++) {
          result.push(`${i + 1}. \`${callbackList[i]}\``);
        }
        result.push("");
      }

      writeFileSync(
        join(dirName, `./agent/${agentSchema.agentName}.md`),
        result.join("\n")
      );
    },
    {
      maxExec: THREAD_POOL_SIZE,
    }
  );

  /**
   * Dumps the documentation for all swarms and agents.
   * @param {string} [dirName=join(process.cwd(), "docs/chat")] - The directory to write the documentation to.
   * @returns {Promise<void>}
   */
  public dumpDocs = async (dirName = join(process.cwd(), "docs/chat")) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs", {
        dirName,
      });
    for (const subDir of SUBDIR_LIST) {
      const path = join(dirName, subDir);
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    }
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building swarm docs");
    await Promise.all(
      this.swarmValidationService.getSwarmList().map(async (swarmName) => {
        const swarmSchema = this.swarmSchemaService.get(swarmName);
        await this.writeSwarmDoc(swarmSchema, dirName);
      })
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("docService dumpDocs building agent docs");
    await Promise.all(
      this.agentValidationService.getAgentList().map(async (agentName) => {
        const agentSchema = this.agentSchemaService.get(agentName);
        await this.writeAgentDoc(agentSchema, dirName);
      })
    );
  };

  public dumpPerfomance = async (dirName = join(process.cwd(), "docs/meta")) => {
    
  };
}

export default DocService;
