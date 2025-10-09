import { json } from "agent-swarm-kit";
import { OutlineName } from "./lib/swarm";

console.log(await json(OutlineName.TestOutline, "John Doe, 30 years old"));
