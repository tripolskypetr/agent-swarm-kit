import { not, queued, Subject } from "functools-kit";
import { omit } from "lodash-es";
import { IModelMessage } from "../model/ModelMessage.model";
import { IAgent, IAgentParams } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

const getPlaceholder = () =>
  GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS[
    Math.floor(Math.random() * GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.length)
  ];

export class ClientAgent implements IAgent {
  readonly _toolCommitSubject = new Subject<void>();
  readonly _outputSubject = new Subject<string>();

  constructor(readonly params: IAgentParams) {}

  _emitOuput = async (result: string) => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} _emitOuput`
    );
    let validation: string | null = null;
    if (validation = await this.params.validate(result)) {
      const result = await this._resurrectModel(validation);
      if (validation = await this.params.validate(result)) {
        throw new Error(
          `agent-swarm-kit ClientAgent agentName=${this.params.agentName} model ressurect failed: ${validation}`
        );
      }
      await this._outputSubject.next(result);
      return;
    }
    await this._outputSubject.next(result);
    return;
  };

  _resurrectModel = async (reason?: string) => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} _resurrectModel`
    );
    {
      await this.params.history.push({
        role: "resque",
        agentName: this.params.agentName,
        content: reason || "Unknown error",
      });
      await this.params.history.push({
        role: "user",
        agentName: this.params.agentName,
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_PROMPT,
      });
    }
    const message = await this.getCompletion();
    const result = message.content;
    let validation: string | null = null;
    if (validation = await this.params.validate(result)) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} _resurrectModel validation error: ${validation}`
      );
      const content = getPlaceholder();
      await this.params.history.push({
        agentName: this.params.agentName,
        role: "assistant",
        content,
      })
      return content;
    }
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    return result;
  };

  waitForOutput = async () => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} waitForOutput`
    );
    return await this._outputSubject.toPromise();
  };

  getCompletion = async (): Promise<IModelMessage> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} getCompletion`
    );
    const messages = await this.params.history.toArrayForAgent(this.params.prompt);
    return await this.params.completion.getCompletion(
      this.params.agentName,
      messages,
      this.params.tools?.map((t) => omit(t, "toolName", "call", "validate"))
    );
  };

  commitSystemMessage = async (message: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} commitSystemMessage`
    );
    await this.params.history.push({
      role: "system",
      agentName: this.params.agentName,
      content: message.trim(),
    });
  };

  commitToolOutput = async (content: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} commitToolOutput content=${content}`
    );
    await this.params.history.push({
      role: "tool",
      agentName: this.params.agentName,
      content,
    });
    await this._toolCommitSubject.next();
  };

  execute = queued(async (incoming: string) => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} execute begin`,
      { incoming }
    );
    await this.params.history.push({
      role: "user",
      agentName: this.params.agentName,
      content: incoming.trim(),
    });
    const message = await this.getCompletion();
    if (message.tool_calls) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} tool call begin`
      );
      for (const tool of message.tool_calls) {
        const targetFn = this.params.tools?.find(
          (t) => t.function.name === tool.function.name
        );
        await this.params.history.push({
          ...message,
          agentName: this.params.agentName,
        });
        if (!targetFn) {
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool function not found`
          );
          const result = await this._resurrectModel(
            `No target function for ${tool.function.name}`
          );
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} execute end result=${result}`
          );
          await this._emitOuput(result);
          return;
        }
        if (
          await not(
            targetFn.validate(this.params.clientId, this.params.agentName, tool.function.arguments)
          )
        ) {
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool validation not passed`
          );
          const result = await this._resurrectModel(
            `Function validation failed: name=${
              tool.function.name
            } arguments=${JSON.stringify(tool.function.arguments)}`
          );
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} execute end result=${result}`
          );
          await this._emitOuput(result);
          return;
        }
        /**
         * @description Do not await to avoid deadlock! The tool can send the message to other agents by emulating user messages
         */
        targetFn.call(this.params.clientId, this.params.agentName, tool.function.arguments);
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool call executing`
        );
        await Promise.race([
          this._toolCommitSubject.toPromise(),
          this._outputSubject.toPromise(),
        ]);
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} functionName=${tool.function.name} tool call end`
        );
        return;
      }
    }
    if (!message.tool_calls) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} execute no tool calls detected`
      );
    }
    const result = message.content;
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    let validation: string | null = null;
    if (validation = await this.params.validate(result)) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} execute invalid tool call detected: ${validation}`,
        { result }
      );
      const result1 = await this._resurrectModel(
        `Invalid model output: ${result}`
      );
      await this._emitOuput(result1);
      return;
    }
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} execute end result=${result}`
    );
    await this._emitOuput(result);
  }) as IAgent["execute"];
}

export default ClientAgent;
