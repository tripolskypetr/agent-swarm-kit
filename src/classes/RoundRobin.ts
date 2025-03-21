import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

/** @private Constant for logging the call method in RoundRobin */
const METHOD_NAME_CALL = "RoundRobin.call";

/** @private Constant for logging the create method in RoundRobin */
const METHOD_NAME_CREATE = "RoundRobin.create";

/**
 * A generic RoundRobin implementation that cycles through token-based instance creators.
 * @template T The type of instances created
 * @template Token The type of tokens
 * @template A The type of arguments (extends any[])
 */
export class RoundRobin<
  T,
  Token = string | symbol | { [key: string]: any },
  A extends any[] = any[]
> {
  private tokens: Token[];
  private instances: Map<Token, (...args: A) => T>;
  private currentIndex = 0;

  private constructor(tokens: Token[], factory: (token: Token) => (...args: A) => T) {
    this.tokens = tokens;
    this.instances = new Map(tokens.map((token) => [token, factory(token)]));
  }

  /**
   * Creates a RoundRobin function that cycles through tokens
   * @example
   * const rr = RoundRobin.create(['a', 'b'], (t) => () => ({ id: t }));
   */
  public static create<
    T,
    Token = string | symbol | { [key: string]: any },
    A extends any[] = any[]
  >(
    tokens: Token[],
    factory: (token: Token) => (...args: A) => T
  ): (...args: A) => T {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CREATE, {
        tokenCount: tokens.length,
      });
    return new RoundRobin<T, Token, A>(tokens, factory).call;
  }

  private call = (...args: A): T => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CALL, {
        currentIndex: this.currentIndex,
        tokenCount: this.tokens.length,
      });
    if (!this.tokens.length) {
      throw new Error("agent-swarm RoundRobin requires non-empty tokens array");
    }
    const token = this.tokens[this.currentIndex];
    const instance = this.instances.get(token)!;
    const value = instance(...args);
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
    return value;
  }
}
