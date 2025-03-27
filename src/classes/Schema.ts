import { GLOBAL_CONFIG } from "../config/params";
import objectFlat from "../utils/objectFlat";
import swarm from "../lib";
import beginContext from "../utils/beginContext";
import { PersistMemoryAdapter } from "./Persist";
import { queued } from "functools-kit";

/** @private Constant for logging the serialize method in SchemaUtils */
const METHOD_NAME_SERIALIZE = "SchemaUtils.serialize";

/** @private Constant for logging the writeSessionMemory method in SchemaUtils */
const METHOD_NAME_WRITE = "SchemaUtils.write";

/** @private Constant for logging the readSessionMemory method in SchemaUtils */
const METHOD_NAME_READ = "SchemaUtils.read";

/**
 * @private
 * Asynchronous function for persisting session memory values for a specific client.
 * If the global configuration enables persistent memory storage, it uses the `PersistMemoryAdapter`
 * to store the memory value associated with the given client ID.
 *
 * @template T - The type of the memory value to persist, must extend object.
 * @param {string} clientId - The ID of the client whose memory value is being persisted.
 * @param {T} memoryValue - The memory value to persist, typically an object.
 * @returns {Promise<void>} A promise that resolves when the memory value is successfully persisted.
 */
const PERSIST_WRITE_FN = async <T extends object = object>(
  clientId: string,
  memoryValue: T
) => {
  if (GLOBAL_CONFIG.CC_PERSIST_MEMORY_STORAGE) {
    return await PersistMemoryAdapter.setMemory(memoryValue, clientId);
  }
};

/**
 * @private
 * Symbol used as a unique key for the queued version of the `PERSIST_WRITE_FN` function.
 * This ensures that the function is executed in a controlled, serialized manner to avoid
 * race conditions when persisting memory values.
 */
const PERSIST_WRITE_SYMBOL = Symbol("persist-write-fn");

/**
 * Utility class for managing schema-related operations, including session memory access and data serialization.
 * Provides methods to read/write client session memory and serialize objects into formatted strings.
 */
export class SchemaUtils {
  /**
   * @private
   * A queued version of the `PERSIST_WRITE_FN` function, ensuring serialized execution.
   * This property is used to persist session memory values for a specific client in a controlled manner,
   * avoiding race conditions during concurrent writes.
   *
   * @template T - The type of the memory value to persist, must extend object.
   * @param {string} clientId - The ID of the client whose memory value is being persisted.
   * @param {T} memoryValue - The memory value to persist, typically an object.
   * @returns {Promise<void>} A promise that resolves when the memory value is successfully persisted.
   */
  private [PERSIST_WRITE_SYMBOL] = queued(PERSIST_WRITE_FN) as <
    T extends object = object
  >(
    clientId: string,
    memoryValue: T
  ) => Promise<void>;

  /**
   * Writes a value to the session memory for a given client.
   * Executes within a context for logging and validation, ensuring the client session is valid.
   * @template T - The type of the value to write, must extend object.
   * @param {string} clientId - The ID of the client whose session memory will be updated.
   * @param {T} value - The value to write to the session memory, typically an object.
   * @returns {T} The value written to the session memory, as returned by the memory schema service.
   * @throws {Error} If session validation fails or the memory schema service encounters an error.
   */
  public writeSessionMemory = beginContext(
    async (clientId: string, value: object) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_WRITE, {
          clientId,
          value,
        });
      swarm.sessionValidationService.validate(clientId, METHOD_NAME_WRITE);
      const memoryValue = swarm.memorySchemaService.writeValue(clientId, value);
      this[PERSIST_WRITE_SYMBOL](clientId, memoryValue);
      return memoryValue;
    }
  ) as <T extends object = object>(clientId: string, value: T) => Promise<T>;

  /**
   * Reads a value from the session memory for a given client.
   * Executes within a context for logging and validation, ensuring the client session is valid.
   * @template T - The type of the value to read, must extend object.
   * @param {string} clientId - The ID of the client whose session memory will be read.
   * @returns {T} The value read from the session memory, as returned by the memory schema service.
   * @throws {Error} If session validation fails or the memory schema service encounters an error.
   */
  public readSessionMemory = beginContext(
    async (clientId: string): Promise<object> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_READ, {
          clientId,
        });
      swarm.sessionValidationService.validate(clientId, METHOD_NAME_READ);
      if (swarm.memorySchemaService.hasValue(clientId)) {
        return swarm.memorySchemaService.readValue(clientId);
      }
      if (GLOBAL_CONFIG.CC_PERSIST_MEMORY_STORAGE) {
        return swarm.memorySchemaService.writeValue(
          clientId,
          await PersistMemoryAdapter.getMemory(clientId, {})
        );
      }
      return swarm.memorySchemaService.readValue(clientId);
    }
  ) as <T extends object = object>(clientId: string) => Promise<T>;

  /**
   * Serializes an object or array of objects into a formatted string.
   * Flattens nested objects and applies optional key/value mapping functions for formatting.
   * @template T - The type of the object(s) to serialize, defaults to any.
   * @param {T[] | T} data - The data to serialize, either a single object or an array of objects.
   * @param {Object} [map] - Optional configuration for mapping keys and values.
   * @param {(key: string) => string} [map.mapKey=GLOBAL_CONFIG.CC_NAME_TO_TITLE] - Function to transform property keys.
   * @param {(key: string, value: string) => string} [map.mapValue] - Function to transform property values, defaults to truncating at 50 characters.
   * @returns {string} A formatted string representation of the data, with key-value pairs separated by newlines.
   */
  public serialize = <T extends object = any>(
    data: T[] | T,
    map: {
      mapKey?: typeof GLOBAL_CONFIG.CC_NAME_TO_TITLE;
      mapValue?: (key: string, value: string) => string;
    } = {}
  ): string => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_SERIALIZE, {
        data,
      });
    const {
      mapKey = GLOBAL_CONFIG.CC_NAME_TO_TITLE,
      mapValue = (_, value) => value.slice(0, 50),
    } = map;
    if (Array.isArray(data)) {
      return data
        .map((item: T) =>
          objectFlat(item)
            .map(([key, value]) => [mapKey(key), mapValue(key, String(value))])
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        )
        .join(`\n\n\n\n`);
    }
    return objectFlat(data)
      .map(([key, value]) => [mapKey(key), mapValue(key, String(value))])
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };
}

/**
 * Singleton instance of SchemaUtils for managing schema operations.
 * @type {SchemaUtils}
 */
export const Schema = new SchemaUtils();

export default Schema;
