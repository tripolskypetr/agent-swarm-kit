export interface IToolCall {
    function: {
        name: string;
        arguments: {
            [key: string]: any;
        };
    };
}

export interface ITool {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            required: string[];
            properties: {
                [key: string]: {
                    type: string;
                    description: string;
                    enum?: string[];
                };
            };
        };
    };
}