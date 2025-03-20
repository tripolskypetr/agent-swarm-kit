import { addPolicy } from "agent-swarm-kit";
import { PolicyName } from "../../enum/PolicyName";

addPolicy({
    policyName: PolicyName.CrimeaPolicy,
    autoBan: true,
    banMessage: "I am not going to discuss crimea crisis",
    validateInput: (incoming) => !incoming.toLowerCase().includes("crimea"),
})
