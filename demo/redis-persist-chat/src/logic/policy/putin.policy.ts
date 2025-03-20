import { addPolicy } from "agent-swarm-kit";
import { PolicyName } from "../../enum/PolicyName";

addPolicy({
    policyName: PolicyName.PutinPolicy,
    autoBan: true,
    banMessage: "I am not going to discuss the politics",
    validateInput: (incoming) => !incoming.toLowerCase().includes("putin"),
})
