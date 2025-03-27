import { glob } from "glob";
import { join } from "path";
import { writeFile, readFile, mkdir } from "fs/promises"

await mkdir("./tmp", { recursive: true });

const result = [];

for (const dir of await glob("./demo/*/docs/chat")) {
    result.push("");
    result.push(`# Directory ${dir}`);
    result.push("");
    const swarmQuery = join(dir, "*.md").split("\\").join("/");
    const agentQuery = join(dir, "agent/*.md").split("\\").join("/");
    for (const file of await glob(swarmQuery)) {
        result.push(await readFile(file));
        console.log(file)
    }
    for (const file of await glob(agentQuery)) {
        result.push(await readFile(file));
        console.log(file)
    }
    result.push("");
    result.push("");
    result.push("");
}

writeFile("./tmp/demo_docs.md", result.map((value) => value.toString()).join("\n"));
