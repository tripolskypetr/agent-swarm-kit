import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SessionId } from "../../../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service to manage memory schema for different sessions.
 */
export class MemorySchemaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private memoryMap = new Map<SessionId, object>();

  /**
   * Writes a value to the memory map for a given client ID.
   *
   * @template T - The type of the value to be written.
   * @param {string} clientId - The ID of the client.
   * @param {T} value - The value to be written.
   */
  public writeValue = <T extends object = object>(
    clientId: string,
    value: T
  ): T => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService setValue`, {
        clientId,
        value,
      });
    const pendingValue = Object.assign(
      this.memoryMap.get(clientId) ?? {},
      value
    );
    this.memoryMap.set(clientId, pendingValue);
    return pendingValue;
  };

  /**
   * Reads a value from the memory map for a given client ID.
   *
   * @template T - The type of the value to be read.
   * @param {string} clientId - The ID of the client.
   * @returns {T} - The value associated with the client ID.
   */
  public readValue = <T extends object = object>(clientId: string): T => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService getValue`, {
        clientId,
      });
    return (this.memoryMap.get(clientId) ?? {}) as T;
  };

  /**
   * Disposes the memory map entry for a given client ID.
   *
   * @param {string} clientId - The ID of the client.
   */
  public dispose = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`memorySchemaService dispose`, {
        clientId,
      });
    this.memoryMap.delete(clientId);
  };
}

export default MemorySchemaService;
