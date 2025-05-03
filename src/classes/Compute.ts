import { GLOBAL_CONFIG } from "../config/params";
import { ComputeName } from "../interfaces/Compute.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

const METHOD_NAME_UPDATE = "ComputeUtils.update";
const METHOD_NAME_GET_COMPUTE_DATA = "ComputeUtils.getComputeData";

export class ComputeUtils {
  public update = beginContext(
    async (clientId: string, computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPDATE, {
          clientId,
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_UPDATE);
      return await swarm.computePublicService.update(
        METHOD_NAME_UPDATE,
        clientId,
        computeName,
      );
    }
  ); 
  
  public getComputeData = beginContext(
    async (clientId: string, computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET_COMPUTE_DATA, {
          clientId,
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_GET_COMPUTE_DATA);
      return await swarm.computePublicService.getComputeData(
        METHOD_NAME_GET_COMPUTE_DATA,
        clientId,
        computeName,
      );
    }
  );
}

export const Compute = new ComputeUtils();

export default Compute;
