import { SwarmName } from "../interfaces/Swarm.interface";
import { session } from "../functions/target/session";
import { singleshot, Subject } from "functools-kit";
import { SessionId } from "../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

/** @constant {string} Method name for beginning a chat in ChatUtils */
const CHAT_UTILS_METHOD_NAME_BEGIN_CHAT = "ChatUtils.beginChat";
/** @constant {string} Method name for sending a message in ChatUtils */
const CHAT_UTILS_METHOD_NAME_SEND_MESSAGE = "ChatUtils.sendMessage";
/** @constant {string} Method name for listening to dispose events in ChatUtils */
const CHAT_UTILS_METHOD_NAME_LISTEN_DISPOSE = "ChatUtils.listenDispose";
/** @constant {string} Method name for disposing a chat in ChatUtils */
const CHAT_UTILS_METHOD_NAME_DISPOSE = "ChatUtils.dispose";

/** @constant {string} Method name for beginning a chat in ChatInstance */
const CHAT_INSTANCE_METHOD_NAME_BEGIN_CHAT = "ChatInstance.beginChat";
/** @constant {string} Method name for sending a message in ChatInstance */
const CHAT_INSTANCE_METHOD_NAME_SEND_MESSAGE = "ChatInstance.sendMessage";
/** @constant {string} Method name for disposing a chat in ChatInstance */
const CHAT_INSTANCE_METHOD_NAME_DISPOSE = "ChatInstance.dispose";
/** @constant {string} Method name for listening to dispose events in ChatInstance */
const CHAT_INSTANCE_METHOD_NAME_LISTEN_DISPOSE = "ChatInstance.listenDispose";

/** @typedef DisposeFn - Function type for chat instance disposal */
/** Function for chat instance disposal  */
type DisposeFn = () => void;

/** @constant {number} Time interval in milliseconds for inactivity checks (1 minute) */
const INACTIVITY_CHECK = 60 * 1_000;
/** @constant {number} Time in milliseconds before a chat is considered inactive (15 minutes) */
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

/**
 * Represents a single chat instance for a client
 * @class
 */
class ChatInstance {
  /** @private @type {Subject<SessionId>} Subject for disposal notifications */
  private disposeSubject = new Subject<SessionId>();

  /** @type {ReturnType<typeof session>} The chat session instance */
  readonly chatSession: ReturnType<typeof session>;

  /** @private @type {number} Timestamp of last activity */
  private _lastActivity: number = Date.now();

  /**
   * Gets the timestamp of the last activity
   * @public
   * @returns {number} Last activity timestamp in milliseconds
   */
  public get lastActivity() {
    return this._lastActivity;
  }

  /**
   * Creates a new ChatInstance
   * @constructor
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {SwarmName} swarmName - Name of the swarm this chat belongs to
   * @param {DisposeFn} onDispose - Callback function executed when chat is disposed
   */
  constructor(
    private readonly clientId: SessionId,
    private readonly swarmName: SwarmName,
    private readonly onDispose: DisposeFn
  ) {
    this.chatSession = session(this.clientId, this.swarmName, {
      onDispose: this.onDispose,
    });
  }

  /**
   * Initiates the chat session
   * @public
   * @async
   * @returns {Promise<void>} Promise that resolves when chat is initiated
   */
  public beginChat = () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(CHAT_INSTANCE_METHOD_NAME_BEGIN_CHAT, {
        clientId: this.clientId,
        swarmName: this.swarmName,
        timestamp: new Date().toISOString(),
      });
    return Promise.resolve();
  };

  /**
   * Sends a message through the chat session
   * @public
   * @async
   * @param {string} content - The message content to send
   * @returns {Promise<any>} Result of the message completion
   */
  public sendMessage = async (content: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(CHAT_INSTANCE_METHOD_NAME_SEND_MESSAGE, {
        content,
        clientId: this.clientId,
        swarmName: this.swarmName,
        timestamp: new Date().toISOString(),
      });
    this._lastActivity = Date.now();
    return await this.chatSession.complete(content);
  };

  /**
   * Disposes of the chat instance and cleans up resources
   * @public
   * @async
   * @returns {Promise<void>} Promise that resolves when disposal is complete
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(CHAT_INSTANCE_METHOD_NAME_DISPOSE, {
        clientId: this.clientId,
        swarmName: this.swarmName,
        timestamp: new Date().toISOString(),
      });
    await this.disposeSubject.next(this.clientId);
    await this.chatSession.dispose();
  };

  /**
   * Subscribes to disposal events for this chat instance
   * @public
   * @param {(clientId: SessionId) => void} fn - Callback function to execute on disposal
   * @returns {any} Subscription object for managing the subscription
   */
  public listenDispose = (fn: (clientId: SessionId) => void) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(CHAT_INSTANCE_METHOD_NAME_LISTEN_DISPOSE, {
        clientId: this.clientId,
        swarmName: this.swarmName,
      });
    return this.disposeSubject.once(fn);
  };
}

/**
 * Utility class for managing multiple chat instances
 * @class
 */
export class ChatUtils {
  /** @private @type {Map<SessionId, ChatInstance>} Map of active chat instances */
  private _chats: Map<SessionId, ChatInstance> = new Map();

  /**
   * Initializes cleanup interval for inactive chats
   * @private
   * @returns {void}
   */
  private initializeCleanup = singleshot(() => {
    const handleCleanup = async () => {
      const now = Date.now();
      for (const chat of this._chats.values()) {
        if (now - chat.lastActivity >= INACTIVITY_TIMEOUT) {
          await chat.dispose();
        }
      }
    };
    setInterval(handleCleanup, INACTIVITY_CHECK);
  });

  /**
   * Gets or creates a chat instance for a client
   * @private
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {ChatInstance} Existing or new chat instance for the client
   */
  private getChatInstance = (clientId: SessionId, swarmName: SwarmName) => {
    return this._chats.has(clientId)
      ? this._chats.get(clientId)!
      : this._chats
          .set(
            clientId,
            new ChatInstance(clientId, swarmName, () => {
              this._chats.delete(clientId);
            })
          )
          .get(clientId)!;
  };

  /**
   * Begins a chat session for a client
   * @public
   * @async
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<void>} Promise that resolves when chat begins
   */
  public beginChat = async (clientId: SessionId, swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(CHAT_UTILS_METHOD_NAME_BEGIN_CHAT, {
        clientId,
        swarmName,
      });
    this.initializeCleanup();
    return await this.getChatInstance(clientId, swarmName).beginChat();
  };

  /**
   * Sends a message for a specific client
   * @public
   * @async
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {string} message - Message content to send
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<any>} Result of the message sending operation
   */
  public sendMessage = async (
    clientId: SessionId,
    message: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(CHAT_UTILS_METHOD_NAME_SEND_MESSAGE, {
        clientId,
        message,
        swarmName,
      });
    this.initializeCleanup();
    return await this.getChatInstance(clientId, swarmName).sendMessage(message);
  };

  /**
   * Subscribes to disposal events for a specific client's chat
   * @public
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {SwarmName} swarmName - Name of the swarm
   * @param {(clientId: SessionId) => void} fn - Callback function for disposal events
   * @returns {any} Subscription object for managing the subscription
   */
  public listenDispose = (
    clientId: SessionId,
    swarmName: SwarmName,
    fn: (clientId: SessionId) => void
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(CHAT_UTILS_METHOD_NAME_LISTEN_DISPOSE, {
        clientId,
        swarmName,
      });
    return this.getChatInstance(clientId, swarmName).listenDispose(fn);
  };

  /**
   * Disposes of a specific chat instance for a client
   * @public
   * @async
   * @param {SessionId} clientId - Unique identifier for the client
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<void>} Promise that resolves when disposal is complete
   */
  public dispose = async (clientId: SessionId, swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(CHAT_UTILS_METHOD_NAME_DISPOSE, {
        clientId,
        swarmName,
      });
    if (!this._chats.has(clientId)) {
      return;
    }
    return await this.getChatInstance(clientId, swarmName).dispose();
  };
}

/** @constant {ChatUtils} Singleton instance of ChatUtils for application-wide use */
export const Chat = new ChatUtils();
