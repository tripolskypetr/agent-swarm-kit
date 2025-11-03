type Image = Uint8Array | string;

/**
 * @interface IAdvisorCallbacks
 * Callback functions for advisor operations
*/
export interface IAdvisorCallbacks<T = string> {
    /**
     * Optional callback triggered when a chat operation occurs
    */
    onChat?: (args: IChatArgs<T>) => void;
}

/**
 * @interface IChatArgs
 * Arguments required for chat operations
*/
export interface IChatArgs<T = string> {
    /** Message content for the chat*/
    message: T;
    /** Optional array of images associated with the chat. */
    images?: Image[];
}

/**
 * @interface IAdvisorSchema
 * Schema definition for advisor configuration
*/
export interface IAdvisorSchema<T = string> {
    /** Optional description of the advisor documentation*/
    docDescription?: string;
    /** Name identifier for the advisor*/
    advisorName: AdvisorName;
    /**
     * Function to get chat response
     */
    getChat(args: IChatArgs<T>): Promise<string>;
    /** Optional callbacks for advisor operations*/
    callbacks?: IAdvisorCallbacks<T>;
}

/**
 * Type alias for advisor name identifier.
 * Used to identify and reference specific advisor instances.
*/
export type AdvisorName = string;
