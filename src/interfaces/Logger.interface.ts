/**
 * ILogger interface for logging messages.
 */
export interface ILogger {
    /**
     * Logs a message.
     * @param {...any[]} args - The message or messages to log.
     */
    log(...args: any[]): void;

    /**
     * Logs a debug message.
     * @param {...any[]} args - The debug message or messages to log.
     */
    debug(...args: any[]): void;
}
