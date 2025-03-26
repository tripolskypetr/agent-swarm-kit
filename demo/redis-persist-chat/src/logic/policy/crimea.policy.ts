import { addPolicy } from "agent-swarm-kit";
import { PolicyName } from "../../enum/PolicyName";

addPolicy({
    docDescription: "This policy, named CrimeaPolicy, operates within the persist-redis-storage project to automatically ban users and respond with a refusal message when input mentions 'crimea', preventing discussions about the Crimea crisis while chat history and agent states are persisted in Redis elsewhere in the system.",
    policyName: PolicyName.CrimeaPolicy,
    autoBan: true,
    banMessage: "I am not going to discuss crimea crisis",
    validateInput: (incoming) => !incoming.toLowerCase().includes("crimea"),
});