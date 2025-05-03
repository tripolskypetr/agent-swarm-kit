import { GLOBAL_CONFIG } from "../config/params";
import { ComputeName } from "../interfaces/Compute.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

const METHOD_NAME_UPDATE = "SharedComputeUtils.update";
const METHOD_NAME_GET_COMPUTE_DATA = "SharedComputeUtils.getComputeData";

export class SharedComputeUtils {
  public update = beginContext(
    async (computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPDATE, {
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_UPDATE);
      return await swarm.sharedComputePublicService.update(
        METHOD_NAME_UPDATE,
        computeName,
      );
    }
  ); 
  
  public getComputeData = beginContext(
    async (computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET_COMPUTE_DATA, {
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_GET_COMPUTE_DATA);
      return await swarm.sharedComputePublicService.getComputeData(
        METHOD_NAME_GET_COMPUTE_DATA,
        computeName,
      );
    }
  );
}

export const SharedCompute = new SharedComputeUtils();

export default SharedCompute;
