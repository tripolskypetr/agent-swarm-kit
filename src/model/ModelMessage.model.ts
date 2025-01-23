export interface IModelMessage {
    role: 'assistant' | 'system' | 'tool' | 'user' | 'resque';
    agentName: string;
    content: string;
    tool_calls?: {
        function: {
            name: string;
            arguments: {
                [key: string]: any;
            };
        };
    }[];
}
