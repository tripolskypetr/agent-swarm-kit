import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

/** @private Constant for logging the call method in RoundRobin */
const METHOD_NAME_CALL = "RoundRobin.call";

/** @private Constant for logging the create method in RoundRobin */
const METHOD_NAME_CREATE = "RoundRobin.create";

/**
 * A generic RoundRobin implementation that distributes calls across a set of tokens
 * using a factory function to create instances.
 * @template T The type of instances created by the factory
 * @template Token The type of tokens to cycle through
 * @template A The type of arguments passed to the factory (extends any[])
 */
export class RoundRobin<
  T,
  Token = string | symbol | { [key: string]: any },
  A extends any[] = any[]
> {
  /** @private Array of tokens to cycle through */
  private tokens: Token[];

  /** @private Factory function to create instances */
  private factory: (token: Token, ...args: A) => T;

  /** @private Map storing created instances by token */
  private instances: Map<string | symbol, T>;

  /** @private Current position in the token rotation */
  private currentIndex: number;

  /**
   * Creates a new RoundRobin instance
   * @private
   * @param tokens - Array of tokens to cycle through
   * @param factory - Function that creates instances given a token and arguments
   */
  private constructor(
    tokens: Token[],
    factory: (token: Token, ...args: A) => T
  ) {
    this.tokens = tokens;
    this.factory = factory;
    this.instances = new Map();
    this.currentIndex = 0;
  }

  /**
   * Creates a RoundRobin function that cycles through tokens
   * @template T The type of instances created by the factory
   * @template Token The type of tokens to cycle through
   * @template A The type of arguments passed to the factory
   * @param tokens - Array of tokens to cycle through
   * @param factory - Function that creates instances given a token and arguments
   * @returns A function that returns the next instance in the rotation
   * @example
   * const rr = RoundRobin.create(['a', 'b'], (token) => ({ id: token }));
   * const instance1 = rr(); // { id: 'a' }
   * const instance2 = rr(); // { id: 'b' }
   * @example
   * const rr2 = RoundRobin.create<number[]>([[1], [2]], (token) => token[0]);
   * const num1 = rr2(); // 1
   * const num2 = rr2(); // 2
   */
  public static create<
    T,
    Token = string | symbol | { [key: string]: any },
    A extends any[] = any[]
  >(tokens: Token[], factory: (token: Token, ...args: A) => T) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CREATE, {
        tokenCount: tokens.length,
      });

    const roundRobin = new RoundRobin<T, Token, A>(tokens, factory);
    return (...args: A) => roundRobin.call(...args);
  }

  /**
   * Gets the next instance in the rotation, creating it if necessary
   * @private
   * @param args - Arguments to pass to the factory function
   * @returns The next instance in the rotation
   */
  private call(...args: A): T {
    // Log the call
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CALL, {
        currentIndex: this.currentIndex,
        tokenCount: this.tokens.length,
      });

    // Get the current token
    const token = this.tokens[this.currentIndex];

    // Generate a map key (strings and symbols can be used directly, objects are stringified)
    const key =
      typeof token === "object" && token !== null
        ? JSON.stringify(token)
        : (token as string | symbol);

    // Create instance if it doesn't exist
    if (!this.instances.has(key)) {
      const instance = this.factory(token, ...args);
      this.instances.set(key, instance);
    }

    // Get the instance
    const instance = this.instances.get(key)!;

    // Update index for next call
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;

    return instance;
  }
}

