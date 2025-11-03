/**
 * @interface IAdvisorCallbacks
 * Callback functions for advisor operations
*/
export interface IAdvisorCallbacks<T = string> {
    /**
     * Optional callback triggered when a chat operation occurs
    */
    onChat?: (message: T) => void;
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
    getChat(message: T): Promise<string>;
    /** Optional callbacks for advisor operations*/
    callbacks?: IAdvisorCallbacks<T>;
}

/**
 * Type alias for advisor name identifier.
 * Used to identify and reference specific advisor instances.
*/
export type AdvisorName = string;
