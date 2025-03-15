import { globSync } from "glob";
import { basename, join, extname, resolve } from "path";

import { createCompletion, loadModel } from "gpt4all";

import fs from "fs";

const MODULE_NAME = "agent-swarm-kit";

const GPT_CLASS_PROMPT =
  "Please write a summary for that Typescript API Reference with several sentences in more human way";

const GPT_INTERFACE_PROMPT =
  "Please write a summary for that Typescript API Reference with several sentences in more human way";

const GPT_TOTAL_PROMPT =
  "Please write a summary for the whole system based on API Reference with several sentences in more human way";

console.log("Loading model");

const model = await loadModel("Nous-Hermes-2-Mistral-7B-DPO.Q4_0.gguf", {
    verbose: true,
});

const generateDescription = async (filePath, prompt) => {
    console.log(`Generating content for ${resolve(filePath)}`);
    console.time("EXECUTE");
    const data = fs.readFileSync(filePath).toString();
    const chat = await model.createChatSession({
        temperature: 0.8,
        systemPrompt: `### System:\n${prompt}.\n\n`,
    });
    const result = await createCompletion(chat, data);
    console.timeEnd("EXECUTE");
    return result.choices[0].message.content;
}


const outputPath = join(process.cwd(), 'docs', `${MODULE_NAME}.md`);
const output = [];

{
    const classList = globSync(`./docs/classes/*`);
    output.push(`# ${MODULE_NAME} classes`);
    output.push("");
    if (!classList.length) {
        output.push("No data available");
    }
    for (const classPath of classList) {
        const className = basename(classPath, extname(classPath));
        output.push(`## Class ${className}`);
        output.push("");
        output.push(await generateDescription(classPath, GPT_CLASS_PROMPT))
        output.push("");
        fs.writeFileSync(outputPath, output.join("\n"));
    }
}

{
    const interfaceList = globSync(`./docs/interfaces/*`);
    output.push(`# ${MODULE_NAME} interfaces`);
    output.push("");
    if (!interfaceList.length) {
        output.push("No data available");
    }
    for (const interfacePath of interfaceList) {
        const interfaceName = basename(interfacePath, extname(interfacePath));
        output.push(`## Interface ${interfaceName}`);
        output.push("");
        output.push(await generateDescription(interfacePath, GPT_INTERFACE_PROMPT))
        output.push("");
        fs.writeFileSync(outputPath, output.join("\n"));
    }
}

{
    output.shift();
    output.shift();
    output.unshift("");
    output.unshift(await generateDescription(outputPath, GPT_TOTAL_PROMPT));
    output.unshift("");
    output.unshift(`# ${MODULE_NAME}`);
    fs.writeFileSync(outputPath, output.join("\n"));
}

