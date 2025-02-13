/**
 * Represents a tool call with a function name and arguments.
 */
export interface IToolCall {
    /**
     * The ID of the tool call.
     */
    id: string;
    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type: 'function';
    /**
     * The function that the model called.
     */
    function: {
        /**
         * The name of the function to be called.
         */
        name: string;
        /**
         * The arguments to be passed to the function.
         */
        arguments: {
            [key: string]: any;
        };
    };
}

/**
 * Represents a tool with a type and function details.
 */
export interface ITool {
    /**
     * The type of the tool.
     */
    type: string;
    function: {
        /**
         * The name of the function.
         */
        name: string;
        /**
         * The description of the function.
         */
        description: string;
        /**
         * The parameters required by the function.
         */
        parameters: {
            /**
             * The type of the parameters.
             */
            type: string;
            /**
             * The list of required parameters.
             */
            required: string[];
            /**
             * The properties of the parameters.
             */
            properties: {
                [key: string]: {
                    /**
                     * The type of the property.
                     */
                    type: string;
                    /**
                     * The description of the property.
                     */
                    description: string;
                    /**
                     * The possible values for the property.
                     */
                    enum?: string[];
                };
            };
        };
    };
}