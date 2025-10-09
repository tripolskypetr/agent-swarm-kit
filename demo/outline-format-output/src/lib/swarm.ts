import {
  addCompletion,
  dumpOutlineResult,
  json,
} from "agent-swarm-kit";
import { jsonrepair } from 'jsonrepair'
import { Ollama } from "ollama";
import { addOutline } from 'agent-swarm-kit';  
  
export enum OutlineName {
    TestOutline = "test_outline",
}

export enum CompletionName {
    TestCompletion = "test_completion",
}

addOutline({  
  outlineName: OutlineName.TestOutline,  
  completion: CompletionName.TestCompletion,  
  prompt: "Extract structured data from the following input",  
  system: ["You are a data extraction assistant"],  
  format: {  
    type: "object",  
    required: ["name", "age"],  
    properties: {  
      name: {  
        type: "string",  
        description: "Person's full name"  
      },  
      age: {  
        type: "number",  
        description: "Person's age in years"  
      }  
    }  
  },  
  maxAttempts: 3,
  async getOutlineHistory({ param, history }) {  
    await history.push({  
      role: "user",  
      content: `Extract data from: ${param}`  
    });  
  },  
  validations: [  
    async ({ data }) => {  
      if (data.age < 0) throw new Error("Age must be positive");  
    }  
  ],  
  callbacks: {
    onValidDocument: async (result) => {
        await dumpOutlineResult(result, "./dump/outline");
    }
  }
});

const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

addCompletion({
  completionName: CompletionName.TestCompletion,
  getCompletion: async ({ messages, format, mode, agentName }) => {

    const response = await ollama.chat({
      model: "gemma3:4b",
      keep_alive: "24h",
      messages: messages.map((message) => ({
        content: message.content,
        role: message.role,
      })),
      format,
    });

    return {
      content: jsonrepair(response.message.content),
      mode,
      agentName,
      role: "assistant",
    };
  },
  json: true,
});
