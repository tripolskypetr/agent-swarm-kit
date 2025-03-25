import { SwarmName } from "../interfaces/Swarm.interface";
import { session } from "../functions/target/session";
import { singleshot, Subject } from "functools-kit";
import { SessionId } from "../interfaces/Session.interface";
import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";

type DisposeFn = () => void;

const INACTIVITY_CHECK = 60 * 1_000;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export interface IChatInstance {
  beginChat(): Promise<void>;
  checkLastActivity(now: number): boolean;
  sendMessage(content: string): Promise<string>;
  dispose(): Promise<void>;
  listenDispose(fn: (clientId: SessionId) => void): void;
}

export interface IChatInstanceCallbacks {
  onCheckActivity(
    clientId: string,
    swarmName: SwarmName,
    isActive: boolean,
    lastActivity: number
  ): void;
  onInit(clientId: string, swarmName: SwarmName, instance: IChatInstance);
  onDispose(clientId: string, swarmName: SwarmName, instance: IChatInstance);
  onBeginChat(clientId: string, swarmName: SwarmName);
  onSendMessage(clientId: string, swarmName: SwarmName, content: string);
}

export interface IChatControl {
  useChatAdapter(Ctor: TChatInstanceCtor): void;
  useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void;
}

type TChatInstanceCtor = new (
  clientId: SessionId,
  swarmName: SwarmName,
  callbacks: IChatInstanceCallbacks,
  onDispose: DisposeFn
) => IChatInstance;

class ChatInstance implements IChatInstance {
  private _disposeSubject = new Subject<SessionId>();
  private _chatSession: ReturnType<typeof session>;
  private _lastActivity: number = Date.now();

  constructor(
    private readonly clientId: SessionId,
    private readonly swarmName: SwarmName,
    private readonly callbacks: Partial<IChatInstanceCallbacks>,
    private readonly onDispose: DisposeFn
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

  public checkLastActivity(now: number) {
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

  public beginChat() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug("ChatInstance.beginChat", {
        clientId: this.clientId,
        swarmName: this.swarmName,
      });
    this.callbacks.onBeginChat &&
      this.callbacks.onBeginChat(this.clientId, this.swarmName);
    return Promise.resolve();
  }

  public async sendMessage(content: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug("ChatInstance.sendMessage", {
        content,
        clientId: this.clientId,
        swarmName: this.swarmName,
      });
    this._lastActivity = Date.now();
    this.callbacks.onSendMessage &&
      this.callbacks.onSendMessage(this.clientId, this.swarmName, content);
    return await this._chatSession.complete(content);
  }

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

  public listenDispose(fn: (clientId: SessionId) => void) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug("ChatInstance.listenDispose", {
        clientId: this.clientId,
        swarmName: this.swarmName,
      });
    return this._disposeSubject.once(fn);
  }
}

export class ChatUtils implements IChatControl {
  private ChatInstanceFactory: TChatInstanceCtor = ChatInstance;
  private ChatInstanceCallbacks: Partial<IChatInstanceCallbacks> = {};

  private _chats: Map<SessionId, IChatInstance> = new Map();

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

  public useChatAdapter(Ctor: TChatInstanceCtor): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatAdapter");
    this.ChatInstanceFactory = Ctor;
  }

  public useChatCallbacks(Callbacks: Partial<IChatInstanceCallbacks>): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.useChatCallbacks");
    Object.assign(this.ChatInstanceCallbacks, Callbacks);
  }

  private getChatInstance = (clientId: SessionId, swarmName: SwarmName) => {
    return this._chats.has(clientId)
      ? this._chats.get(clientId)!
      : this._chats
          .set(
            clientId,
            Reflect.construct(this.ChatInstanceFactory, [
              clientId,
              swarmName,
              this.ChatInstanceCallbacks,
              () => this._chats.delete(clientId),
            ])
          )
          .get(clientId)!;
  };

  public beginChat = async (clientId: SessionId, swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log("ChatUtils.beginChat", {
        clientId,
        swarmName,
      });
    this.initializeCleanup();
    return await this.getChatInstance(clientId, swarmName).beginChat();
  };

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

export const Chat = new ChatUtils();
