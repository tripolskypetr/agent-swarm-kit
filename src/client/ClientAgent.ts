import { not, queued, Subject } from "functools-kit";
import { omit } from "lodash-es";
import { IModelMessage } from "../model/ModelMessage.model";
import { IAgent, IAgentParams } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

const getPlaceholder = () =>
  GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS[
    Math.floor(
      Math.random() * GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.length
    )
  ];

/**
 * Represents a client agent that interacts with the system.
 * @implements {IAgent}
 */
export class ClientAgent implements IAgent {
  readonly _toolCommitSubject = new Subject<void>();
  readonly _outputSubject = new Subject<string>();

  /**
   * Creates an instance of ClientAgent.
   * @param {IAgentParams} params - The parameters for the agent.
   */
  constructor(readonly params: IAgentParams) {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
  }

  /**
   * Emits the output result after validation.
   * @param {string} result - The result to be emitted.
   * @returns {Promise<void>}
   * @private
   */
  _emitOuput = async (result: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _emitOuput`
    );
    let validation: string | null = null;
    if ((validation = await this.params.validate(result))) {
      const result = await this._resurrectModel(validation);
      if ((validation = await this.params.validate(result))) {
        throw new Error(
          `agent-swarm-kit ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} model ressurect failed: ${validation}`
        );
      }
      await this._outputSubject.next(result);
      return;
    }
    await this._outputSubject.next(result);
    return;
  };

  /**
   * Resurrects the model based on the given reason.
   * @param {string} [reason] - The reason for resurrecting the model.
   * @returns {Promise<string>}
   * @private
   */
  _resurrectModel = async (reason?: string): Promise<string> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel`
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
    if ((validation = await this.params.validate(result))) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel validation error: ${validation}`
      );
      const content = getPlaceholder();
      await this.params.history.push({
        agentName: this.params.agentName,
        role: "assistant",
        content,
      });
      return content;
    }
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    return result;
  };

  /**
   * Waits for the output to be available.
   * @returns {Promise<string>}
   */
  waitForOutput = async (): Promise<string> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput`
    );
    return await this._outputSubject.toPromise();
  };

  /**
   * Gets the completion message from the model.
   * @returns {Promise<IModelMessage>}
   */
  getCompletion = async (): Promise<IModelMessage> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} getCompletion`
    );
    const messages = await this.params.history.toArrayForAgent(
      this.params.prompt
    );
    return await this.params.completion.getCompletion({
      clientId: this.params.clientId,
      agentName: this.params.agentName,
      messages,
      tools: this.params.tools?.map((t) =>
        omit(t, "toolName", "call", "validate")
      ),
    });
  };

  /**
   * Commits a user message to the history without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitUserMessage = async (message: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitUserMessage`
    );
    await this.params.history.push({
      role: "user",
      agentName: this.params.agentName,
      content: message.trim(),
    });
  };

  /**
   * Commits a system message to the history.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  commitSystemMessage = async (message: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitSystemMessage`
    );
    await this.params.history.push({
      role: "system",
      agentName: this.params.agentName,
      content: message.trim(),
    });
  };

  /**
   * Commits the tool output to the history.
   * @param {string} content - The tool output content.
   * @returns {Promise<void>}
   */
  commitToolOutput = async (content: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitToolOutput content=${content}`
    );
    await this.params.history.push({
      role: "tool",
      agentName: this.params.agentName,
      content,
    });
    await this._toolCommitSubject.next();
  };

  /**
   * Executes the incoming message and processes tool calls if any.
   * @param {string} incoming - The incoming message content.
   * @returns {Promise<void>}
   */
  execute = queued(async (incoming: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute begin`,
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
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} tool call begin`
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
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool function not found`,
            this.params.tools
          );
          const result = await this._resurrectModel(
            `No target function for ${tool.function.name}`
          );
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
          );
          await this._emitOuput(result);
          return;
        }
        if (
          await not(
            targetFn.validate(
              this.params.clientId,
              this.params.agentName,
              tool.function.arguments
            )
          )
        ) {
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool validation not passed`
          );
          const result = await this._resurrectModel(
            `Function validation failed: name=${
              tool.function.name
            } arguments=${JSON.stringify(tool.function.arguments)}`
          );
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
          );
          await this._emitOuput(result);
          return;
        }
        /**
         * @description Do not await to avoid deadlock! The tool can send the message to other agents by emulating user messages
         */
        targetFn.call(
          this.params.clientId,
          this.params.agentName,
          tool.function.arguments
        );
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool call executing`
        );
        await Promise.race([
          this._toolCommitSubject.toPromise(),
          this._outputSubject.toPromise(),
        ]);
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool call end`
        );
      }
      return;
    }
    if (!message.tool_calls) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute no tool calls detected`
      );
    }
    const result = message.content;
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    let validation: string | null = null;
    if ((validation = await this.params.validate(result))) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute invalid tool call detected: ${validation}`,
        { result }
      );
      const result1 = await this._resurrectModel(
        `Invalid model output: ${result}`
      );
      await this._emitOuput(result1);
      return;
    }
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
    );
    await this._emitOuput(result);
  }) as IAgent["execute"];
}

export default ClientAgent;
