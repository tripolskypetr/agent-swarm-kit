import { AgentName } from "./Agent.interface";

/**
 * @interface IWikiCallbacks
 * @description Callback functions for wiki operations
 */
export interface IWikiCallbacks {
    /**
     * Optional callback triggered when a chat operation occurs
     * @param {IChatArgs} args - Arguments for the chat operation
     */
    onChat?: (args: IChatArgs) => void;
}

/**
 * @interface IChatArgs
 * @description Arguments required for chat operations
 */
export interface IChatArgs {
    /** Unique identifier for the client */
    clientId: string;
    /** Name of the agent handling the chat */
    agentName: AgentName;
    /** Message content for the chat */
    message: string;
}

/**
 * @interface IWikiSchema
 * @description Schema definition for wiki configuration
 */
export interface IWikiSchema {
    /** Optional description of the wiki documentation */
    docDescription?: string;
    /** Name identifier for the wiki */
    wikiName: WikiName;
    /**
     * Function to get chat response
     * @param {IChatArgs} args - Arguments for the chat operation
     * @returns {Promise<string>} The chat response
     */
    getChat(args: IChatArgs): Promise<string>;
    /** Optional callbacks for wiki operations */
    callbacks?: IWikiCallbacks;
}

/**
 * Type alias for wiki name identifier.
 * Used to identify and reference specific wiki instances.
 */
export type WikiName = string;
