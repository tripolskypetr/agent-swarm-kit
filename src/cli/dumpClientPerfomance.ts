import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import listenExecutionEvent from "../events/listenExecutionEvent";
import beginContext from "../utils/beginContext";

const METHOD_NAME = "cli.dumpClientPerformance";
const METHOD_NAME_INTERNAL = "cli.dumpClientPerformance.internal";
const METHOD_NAME_EXECUTE = "cli.dumpClientPerformance.execute";

/**
 * The internal HOF for handling the performance dump
 *
*/
const dumpClientPerformanceInternal = beginContext(
  async (clientId: string, dirName = "./logs/client") => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_INTERNAL);
    return await swarm.docService.dumpClientPerfomance(clientId, dirName);
  }
);

/**
 * Dumps the performance data using the swarm's document service.
 * Logs the method name if logging is enabled in the global configuration.
 *
*/
const dumpClientPerformance = async (
  clientId: string,
  dirName = "./logs/client"
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
  await dumpClientPerformanceInternal(clientId, dirName);
};

/**
 * Sets up a listener to dump performance data after execution.
 * Logs the method name if logging is enabled in the global configuration.
 *
*/
dumpClientPerformance.runAfterExecute = beginContext(
  async (dirName = "./logs/client") => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_EXECUTE);
    return listenExecutionEvent("*", async ({ type, clientId }) => {
      if (type === "commit-execution-end") {
        await dumpClientPerformanceInternal(clientId, dirName);
      }
    });
  }
);

export { dumpClientPerformance };

export default dumpClientPerformance;
