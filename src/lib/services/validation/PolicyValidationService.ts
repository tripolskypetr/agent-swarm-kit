import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IPolicySchema, PolicyName } from "../../../interfaces/Policy.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating policys within the agent-swarm.
 */
export class PolicyValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _policyMap = new Map<PolicyName, IPolicySchema>();

  /**
   * Adds a new policy to the validation service.
   * @param {PolicyName} policyName - The name of the policy to add.
   * @param {IPolicySchema} policySchema - The schema of the policy to add.
   * @throws Will throw an error if the policy already exists.
   */
  public addPolicy = (policyName: PolicyName, policySchema: IPolicySchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyValidationService addPolicy", {
        policyName,
        policySchema,
      });
    if (this._policyMap.has(policyName)) {
      throw new Error(`agent-swarm policy ${policyName} already exist`);
    }
    this._policyMap.set(policyName, policySchema);
  };

  /**
   * Validates if a policy exists in the validation service.
   * @param {PolicyName} policyName - The name of the policy to validate.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the policy is not found.
   */
  public validate = memoize(
    ([policyName]) => policyName,
    (policyName: PolicyName, source: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("policyValidationService validate", {
          policyName,
          source,
        });
      if (!this._policyMap.has(policyName)) {
        throw new Error(
          `agent-swarm policy ${policyName} not found source=${source}`
        );
      }
      return {} as unknown as void;
    }
  ) as (policyName: PolicyName, source: string) => void;
}

export default PolicyValidationService;
