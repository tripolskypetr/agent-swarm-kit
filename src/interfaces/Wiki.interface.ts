type Image = Uint8Array | string;

/**
 * @interface IWikiCallbacks
 * Callback functions for wiki operations
*/
export interface IWikiCallbacks {
    /**
     * Optional callback triggered when a chat operation occurs
    */
    onChat?: (args: IChatArgs) => void;
}

/**
 * @interface IChatArgs
 * Arguments required for chat operations
*/
export interface IChatArgs {
    /** Message content for the chat*/
    message: string;
    /** Optional array of images associated with the chat. */
    images?: Image[];
}

/**
 * @interface IWikiSchema
 * Schema definition for wiki configuration
*/
export interface IWikiSchema {
    /** Optional description of the wiki documentation*/
    docDescription?: string;
    /** Name identifier for the wiki*/
    wikiName: WikiName;
    /**
     * Function to get chat response
    */
    getChat(args: IChatArgs): Promise<string>;
    /** Optional callbacks for wiki operations*/
    callbacks?: IWikiCallbacks;
}

/**
 * Type alias for wiki name identifier.
 * Used to identify and reference specific wiki instances.
*/
export type WikiName = string;
