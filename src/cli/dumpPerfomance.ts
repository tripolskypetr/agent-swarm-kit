import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { Source } from "functools-kit";
import beginContext from "../utils/beginContext";

const METHOD_NAME = "cli.dumpPerfomance";
const METHOD_NAME_INTERNAL = "cli.dumpPerfomance.internal";
const METHOD_NAME_INTERVAL = "cli.dumpPerfomance.interval";

/**
 * The internal HOF for handling the performance dump
 */
const dumpPerfomanceInternal = beginContext(async (dirName = "./logs/meta") => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME_INTERNAL);
  return await swarm.docService.dumpPerfomance(dirName);
});

/**
 * Dumps the performance data using the swarm's document service.
 * Logs the method name if logging is enabled in the global configuration.
 *
 * @param {string} [dirName="./logs/meta"] - The directory name where the performance data will be dumped.
 * @returns {Promise<void>} A promise that resolves when the performance data has been dumped.
 */
const dumpPerfomance = async (dirName = "./logs/meta") => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
  await dumpPerfomanceInternal(dirName);
};

/**
 * Runs the dumpPerfomance function at specified intervals.
 * Logs the method name if logging is enabled in the global configuration.
 *
 * @param {string} [dirName="./logs/meta"] - The directory name where the performance data will be dumped.
 * @param {number} [interval=30000] - The interval in milliseconds at which to run the dumpPerfomance function.
 */
dumpPerfomance.runInterval = beginContext(
  (dirName = "./logs/meta", interval = 30_000) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_INTERVAL);
    return Source.fromInterval(interval).connect(() => dumpPerfomance(dirName));
  }
);

export { dumpPerfomance };

export default dumpPerfomance;
