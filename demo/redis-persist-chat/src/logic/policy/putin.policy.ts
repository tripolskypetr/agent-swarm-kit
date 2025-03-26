import { addPolicy } from "agent-swarm-kit";
import { PolicyName } from "../../enum/PolicyName";

addPolicy({
    docDescription: "This policy, named PutinPolicy, functions within the persist-redis-storage project to automatically ban users and issue a refusal message when input mentions 'putin', blocking political discussions while chat history and agent states are maintained in Redis throughout the system.",
    policyName: PolicyName.PutinPolicy,
    autoBan: true,
    banMessage: "I am not going to discuss the politics",
    validateInput: (incoming) => !incoming.toLowerCase().includes("putin"),
});
