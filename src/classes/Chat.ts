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

/**
 * Function type for cleanup operations.
 * Called when resources need to be disposed.
*/
type DisposeFn = () => void;

/** @constant {number} INACTIVITY_CHECK - Interval for checking inactivity in milliseconds (1 minute)*/
const INACTIVITY_CHECK = 60 * 1_000;
/** @constant {number} INACTIVITY_TIMEOUT - Timeout duration for inactivity in milliseconds (15 minutes)*/
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

/**
 * @constant {Function} BEGIN_CHAT_FN
 * Function to begin a chat session
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
 * Interface for chat instance functionality
*/
export interface IChatInstance {
  /**
   * Begins a chat session
   */
  beginChat(): Promise<void>;

  /**
   * Checks if the chat has been active within the timeout period
   */
  checkLastActivity(now: number): Promise<boolean>;

  /**
   * Sends a message in the chat
   */
  sendMessage(content: string): Promise<string>;

  /**
   * Disposes of the chat instance
   */
  dispose(): Promise<void>;

  /**
   * Adds a listener for dispose events
   */
  listenDispose(fn: (clientId: SessionId) => void): void;
}

/**
 * @interface IChatInstanceCallbacks
 * Callback interface for chat instance events
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
 * Interface for controlling chat instances
*/
export interface IChatControl {
  /**
   * Sets the chat instance constructor
   */
  useChatAdapter(Ctor: TChatInstanceCtor): void;

  /**
   * Sets chat instance callbacks
   */
  useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void;
}

/**
 * Constructor type for creating chat instances with dispose callback.
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
 * Implementation of a single chat instance
*/
export const ChatInstance = makeExtendable(
  class<Payload extends unknown = any> implements IChatInstance {
    /** @private*/
    _disposeSubject = new Subject<SessionId>();
    /** @private*/
    _chatSession: ReturnType<typeof session>;
    /** @private*/
    _lastActivity: number = Date.now();

    /**
     * @constructor
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
    */
    public beginChat = singleshot(async () => {
      return await BEGIN_CHAT_FN(this);
    });

    /**
     * Sends a message in the chat
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
 * Utility class for managing multiple chat instances
*/
export class ChatUtils implements IChatControl {
  /** @private*/
  private ChatInstanceFactory: TChatInstanceCtor = ChatInstance;
  /** @private*/
  private ChatInstanceCallbacks: Partial<IChatInstanceCallbacks> = {};
  /** @private*/
  private _chats: Map<SessionId, IChatInstance> = new Map();

  /** @private*/
  private initializeCleanup = singleshot(() => {
    const handleCleanup = async () => {
      const now = Date.now();
      for (const chat of this._chats.values()) {
        if (await chat.checkLastActivity(now)) {
          continue;
        }
        await chat.dispose();
      }
    };
    setInterval(handleCleanup, INACTIVITY_CHECK);
  });

  /**
   * Gets or creates a chat instance for a client
   * @private
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
   */
  public useChatAdapter(Ctor: TChatInstanceCtor): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatAdapter");
    this.ChatInstanceFactory = Ctor;
  }

  /**
   * Sets chat instance callbacks
   */
  public useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatCallbacks");
    Object.assign(this.ChatInstanceCallbacks, Callbacks);
  }

  /**
   * Begins a chat session for a client
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
    if (this._chats.has(clientId)) {
      return false;
    }
    this.initializeCleanup();
    await this.getChatInstance(clientId, swarmName, payload).beginChat();
    return true;
  };

  /**
   * Sends a message for a client
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
 * Singleton instance of ChatUtils
*/
export const Chat = new ChatUtils();
