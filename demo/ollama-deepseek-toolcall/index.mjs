import repl from "repl";

import { randomString, Subject, join, str } from "functools-kit";
import { log } from "pinolog";
import {
  addCompletion,
  addSwarm,
  setConfig,
  makeConnection,
  addAgent,
  addTool,
  commitToolOutput,
  execute,
} from "agent-swarm-kit";
import { Ollama } from "ollama";

const ollama = new Ollama();

const TOOL_CALL_PROTOCOL = str.newline([
    "For tool calling send the next JSON schema to the user",
    `{"type": "function", "name": <function-name>, "arguments": <args-json-object>}`,
    "It is important to write json only without any human readable text descriptions cause it would be parsed with JSON.parse"
]);

const removeXmlTags = (output) => {
    console.log("Original output", output)
    return output
        .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};

setConfig({
  CC_AGENT_SYSTEM_PROMPT: [
    TOOL_CALL_PROTOCOL,
  ],
  CC_AGENT_OUTPUT_MAP: (message) => {
    if (message.role !== "assistant") {
        return message;
    }
    try {
        const payload = JSON.parse(message.content);
        if (payload.type === "function") {
            return {
                ...message,
                content: "",
                tool_calls: [
                    {
                        function: {
                            name: payload.name,
                            arguments: payload.arguments,
                        },
                    }
                ]
            }
        }
        return message;
    } catch {
        return message;
    }
  },
  CC_AGENT_OUTPUT_TRANSFORM: removeXmlTags,
});

const DEEPSEEK_COMPLETION = addCompletion({
  completionName: "deepseek_completion",
  getCompletion: async ({ agentName, messages, mode, tools }) => {
    const commonMessages = messages
      .filter(({ tool_calls }) => !tool_calls)
      .map((message) => ({
        content: message.content,
        role: message.role === "tool" ? "system" : message.role,
      }));

    const toolMessages = tools?.map(({ function: f }) => ({
        mode: 'tool',
        agentName,
        role: "system",
        content: `You can call the next tool: ${JSON.stringify(f)}`
    }));

    const response = await ollama.chat({
      model: "deepseek-r1:8b",
      keep_alive: "1h",
      messages: join(commonMessages, toolMessages),
    });
    return {
      ...response.message,
      mode,
      agentName,
    };
  },
});

const TEST_TOOL = addTool({
    toolName: "test_tool",
    validate: () => true,
    function: {
        name: "test_tool",
    },
    call: async (toolId, clientId, agentName, params) => {
        console.log("here", { params })
        await commitToolOutput(toolId, `The next params recived: ${JSON.stringify(params ?? {})}`, clientId, agentName);
        await execute("Tell user the last tool output", clientId, agentName);
    },
})

const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: DEEPSEEK_COMPLETION,
    prompt: "Call the tools on user request",
    tools: [
        TEST_TOOL,
    ],
    callbacks: {
        onResurrect: log,
    }
})

const TEST_SWARM = addSwarm({
  swarmName: "test_swarm",
  agentList: [
    TEST_AGENT,
  ],
  defaultAgent: TEST_AGENT,
});

{
  const clientId = randomString();
  const outgoingSubject = new Subject();

  const receive = makeConnection(
    async (outgoing) => {
      outgoingSubject.next(outgoing);
    },
    clientId,
    TEST_SWARM
  );

  async function run(uInput, context, filename, callback) {
    console.time("Timing");
    receive(uInput);
    const { agentName, data } = await outgoingSubject.toPromise();
    console.timeEnd("Timing");
    callback(null, `[${agentName}]: ${data}`);
  }

  repl.start({ prompt: "node-ollama-agent-swarm => ", eval: run });
}
