import { SwarmName } from "../interfaces/Swarm.interface";
import { session } from "../functions/target/session";
import { makeExtendable, singleshot, Subject } from "functools-kit";
import { SessionId } from "../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

interface TChatInstance extends IChatInstance {
  clientId: string;
  swarmName: SwarmName;
  callbacks: Partial<IChatInstanceCallbacks>;
}

/** @typedef {() => void} DisposeFn */
type DisposeFn = () => void;

/** @constant {number} INACTIVITY_CHECK - Interval for checking inactivity in milliseconds (1 minute) */
const INACTIVITY_CHECK = 60 * 1_000;
/** @constant {number} INACTIVITY_TIMEOUT - Timeout duration for inactivity in milliseconds (15 minutes) */
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

/**
 * @constant {Function} BEGIN_CHAT_FN
 * @description Function to begin a chat session
 * @param {ChatInstance} self - Instance of the ChatInstance
 * @returns {Promise<void>}
 */
const BEGIN_CHAT_FN = (self: TChatInstance) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug("ChatInstance.beginChat", {
      clientId: self.clientId,
      swarmName: self.swarmName,
    });
  self.callbacks.onBeginChat &&
    self.callbacks.onBeginChat(self.clientId, self.swarmName);
  return Promise.resolve();
};

/**
 * @interface IChatInstance
 * @description Interface for chat instance functionality
 */
export interface IChatInstance {
  /**
   * Begins a chat session
   * @returns {Promise<void>}
   */
  beginChat(): Promise<void>;

  /**
   * Checks if the chat has been active within the timeout period
   * @param {number} now - Current timestamp
   * @returns {boolean} Whether the chat is still active
   */
  checkLastActivity(now: number): Promise<boolean>;

  /**
   * Sends a message in the chat
   * @param {string} content - Message content to send
   * @returns {Promise<string>} Response from the chat session
   */
  sendMessage(content: string): Promise<string>;

  /**
   * Disposes of the chat instance
   * @returns {Promise<void>}
   */
  dispose(): Promise<void>;

  /**
   * Adds a listener for dispose events
   * @param {(clientId: SessionId) => void} fn - Callback function to execute on dispose
   */
  listenDispose(fn: (clientId: SessionId) => void): void;
}

/**
 * @interface IChatInstanceCallbacks
 * @description Callback interface for chat instance events
 */
export interface IChatInstanceCallbacks {
  /**
   * Called when checking activity status
   */
  onCheckActivity(
    clientId: string,
    swarmName: SwarmName,
    isActive: boolean,
    lastActivity: number
  ): void;

  /**
   * Called when instance is initialized
   */
  onInit(clientId: string, swarmName: SwarmName, instance: IChatInstance): void;

  /**
   * Called when instance is disposed
   */
  onDispose(
    clientId: string,
    swarmName: SwarmName,
    instance: IChatInstance
  ): void;

  /**
   * Called when chat begins
   */
  onBeginChat(clientId: string, swarmName: SwarmName): void;

  /**
   * Called when message is sent
   */
  onSendMessage(clientId: string, swarmName: SwarmName, content: string): void;
}

/**
 * @interface IChatControl
 * @description Interface for controlling chat instances
 */
export interface IChatControl {
  /**
   * Sets the chat instance constructor
   * @param {TChatInstanceCtor} Ctor - Chat instance constructor
   */
  useChatAdapter(Ctor: TChatInstanceCtor): void;

  /**
   * Sets chat instance callbacks
   * @param {Partial<IChatInstanceCallbacks>} Callbacks - Callback implementations
   */
  useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void;
}

/**
 * @typedef {new (clientId: SessionId, swarmName: SwarmName, callbacks: IChatInstanceCallbacks, onDispose: DisposeFn) => IChatInstance} TChatInstanceCtor
 */
type TChatInstanceCtor = new <Payload extends unknown = any>(
  clientId: SessionId,
  swarmName: SwarmName,
  onDispose: DisposeFn,
  callbacks: IChatInstanceCallbacks,
  payload: Payload
) => IChatInstance;

/**
 * @class ChatInstance
 * @implements {IChatInstance}
 * @description Implementation of a single chat instance
 */
export const ChatInstance = makeExtendable(
  class<Payload extends unknown = any> implements IChatInstance {
    /** @private */
    _disposeSubject = new Subject<SessionId>();
    /** @private */
    _chatSession: ReturnType<typeof session>;
    /** @private */
    _lastActivity: number = Date.now();

    /**
     * @constructor
     * @param {SessionId} clientId - Unique client identifier
     * @param {SwarmName} swarmName - Name of the swarm
     * @param {Partial<IChatInstanceCallbacks>} callbacks - Event callbacks
     * @param {DisposeFn} onDispose - Dispose callback function
     */
    constructor(
      readonly clientId: SessionId,
      readonly swarmName: SwarmName,
      readonly onDispose: DisposeFn,
      readonly callbacks: Partial<IChatInstanceCallbacks>,
      readonly payload: Payload
    ) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug("ChatInstance CTOR", {
          clientId: this.clientId,
          swarmName: this.swarmName,
        });
      this._chatSession = session(this.clientId, this.swarmName, {
        onDispose: this.onDispose,
      });
      this.callbacks.onInit &&
        this.callbacks.onInit(this.clientId, this.swarmName, this);
    }

    /**
     * Checks if the chat has been active within the timeout period
     * @param {number} now - Current timestamp
     * @returns {boolean} Whether the chat is still active
     */
    public async checkLastActivity(now: number) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug("ChatInstance.checkLastActivity", {
          clientId: this.clientId,
          swarmName: this.swarmName,
        });
      const isActive = now - this._lastActivity <= INACTIVITY_TIMEOUT;
      this.callbacks.onCheckActivity &&
        this.callbacks.onCheckActivity(
          this.clientId,
          this.swarmName,
          isActive,
          this._lastActivity
        );
      return isActive;
    }

    /**
     * Begins a chat session
     * @returns {Promise<void>}
     */
    public beginChat = singleshot(async () => {
      return await BEGIN_CHAT_FN(this);
    });

    /**
     * Sends a message in the chat
     * @param {string} content - Message content to send
     * @returns {Promise<string>} Response from the chat session
     */
    public async sendMessage(content: string) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug("ChatInstance.sendMessage", {
          content,
          clientId: this.clientId,
          swarmName: this.swarmName,
        });
      await this.beginChat();
      this._lastActivity = Date.now();
      this.callbacks.onSendMessage &&
        this.callbacks.onSendMessage(this.clientId, this.swarmName, content);
      return await this._chatSession.complete(content);
    }

    /**
     * Disposes of the chat instance
     * @returns {Promise<void>}
     */
    public async dispose() {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug("ChatInstance.dispose", {
          clientId: this.clientId,
          swarmName: this.swarmName,
        });
      await this._disposeSubject.next(this.clientId);
      await this._chatSession.dispose();
      this.callbacks.onDispose &&
        this.callbacks.onDispose(this.clientId, this.swarmName, this);
    }

    /**
     * Adds a listener for dispose events
     * @param {(clientId: SessionId) => void} fn - Callback function to execute on dispose
     */
    public listenDispose(fn: (clientId: SessionId) => void) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug("ChatInstance.listenDispose", {
          clientId: this.clientId,
          swarmName: this.swarmName,
        });
      return this._disposeSubject.once(fn);
    }
  }
);

/**
 * @class ChatUtils
 * @implements {IChatControl}
 * @description Utility class for managing multiple chat instances
 */
export class ChatUtils implements IChatControl {
  /** @private */
  private ChatInstanceFactory: TChatInstanceCtor = ChatInstance;
  /** @private */
  private ChatInstanceCallbacks: Partial<IChatInstanceCallbacks> = {};
  /** @private */
  private _chats: Map<SessionId, IChatInstance> = new Map();

  /** @private */
  private initializeCleanup = singleshot(() => {
    const handleCleanup = async () => {
      const now = Date.now();
      for (const chat of this._chats.values()) {
        if (!chat.checkLastActivity(now)) {
          await chat.dispose();
        }
      }
    };
    setInterval(handleCleanup, INACTIVITY_CHECK);
  });

  /**
   * Gets or creates a chat instance for a client
   * @private
   * @param {SessionId} clientId - Unique client identifier
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {IChatInstance} The chat instance for the given client
   */
  private getChatInstance = <Payload extends unknown = any>(
    clientId: SessionId,
    swarmName: SwarmName,
    payload = {} as Payload
  ) => {
    return this._chats.has(clientId)
      ? this._chats.get(clientId)!
      : this._chats
          .set(
            clientId,
            Reflect.construct(this.ChatInstanceFactory, [
              clientId,
              swarmName,
              () => this._chats.delete(clientId),
              this.ChatInstanceCallbacks,
              payload,
            ])
          )
          .get(clientId)!;
  };

  /**
   * Sets the chat instance constructor
   * @param {TChatInstanceCtor} Ctor - Chat instance constructor
   */
  public useChatAdapter(Ctor: TChatInstanceCtor): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatAdapter");
    this.ChatInstanceFactory = Ctor;
  }

  /**
   * Sets chat instance callbacks
   * @param {Partial<IChatInstanceCallbacks>} Callbacks - Callback implementations
   */
  public useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatCallbacks");
    Object.assign(this.ChatInstanceCallbacks, Callbacks);
  }

  /**
   * Begins a chat session for a client
   * @param {SessionId} clientId - Unique client identifier
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<void>}
   */
  public beginChat = async <Payload extends unknown = any>(
    clientId: SessionId,
    swarmName: SwarmName,
    payload = {} as Payload
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.beginChat", {
        clientId,
        swarmName,
      });
    this.initializeCleanup();
    return await this.getChatInstance(clientId, swarmName, payload).beginChat();
  };

  /**
   * Sends a message for a client
   * @param {SessionId} clientId - Unique client identifier
   * @param {string} message - Message content
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<string>}
   */
  public sendMessage = async (
    clientId: SessionId,
    message: string,
    swarmName: SwarmName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.sendMessage", {
        clientId,
        message,
        swarmName,
      });
    this.initializeCleanup();
    return await this.getChatInstance(clientId, swarmName).sendMessage(message);
  };

  /**
   * Listens for dispose events for a client
   * @param {SessionId} clientId - Unique client identifier
   * @param {SwarmName} swarmName - Name of the swarm
   * @param {(clientId: SessionId) => void} fn - Dispose callback
   */
  public listenDispose = (
    clientId: SessionId,
    swarmName: SwarmName,
    fn: (clientId: SessionId) => void
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.listenDispose", {
        clientId,
        swarmName,
      });
    return this.getChatInstance(clientId, swarmName).listenDispose(fn);
  };

  /**
   * Disposes of a chat instance
   * @param {SessionId} clientId - Unique client identifier
   * @param {SwarmName} swarmName - Name of the swarm
   * @returns {Promise<void>}
   */
  public dispose = async (clientId: SessionId, swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.dispose", {
        clientId,
        swarmName,
      });
    if (!this._chats.has(clientId)) {
      return;
    }
    return await this.getChatInstance(clientId, swarmName).dispose();
  };
}

/**
 * @constant {ChatUtils} Chat
 * @description Singleton instance of ChatUtils
 */
export const Chat = new ChatUtils();
