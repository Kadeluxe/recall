import {AbstractServerOptions, AbstractServerOptionsFull, DefaultAbstractServerOptions} from "~/server/options";
import defaultsDeep from "lodash/defaultsDeep";
import {ServiceDispatcher} from "~/dispatcher/ServiceDispatcher";
import {IServiceInstance} from "~/service/IServiceInstance";
import {onRecallServerInstall} from "~/shared/symbols";
import EventEmitter from "events";
import {re} from "~/server/runtime";
import {ServerChannelService} from "~/server/ServerChannelService";
import {AbstractServerChannel} from "~/server/AbstractServerChannel";
import {ChannelGroup} from "~/server/ChannelGroup";
import {IClientChannelService} from "~/client/ClientChannelService";
import {RecallServiceChannelId} from "~/common/const";
import {ChannelCloseReason} from "~/channel/AbstractChannel";

type EventMap = {
  "client:connect": (client: AbstractServerChannel<any>) => void,
  "client:disconnect": (client: AbstractServerChannel<any>) => void
}

export abstract class AbstractServer<Context = unknown> {
  public readonly options: AbstractServerOptionsFull;
  protected _emitter = new EventEmitter();
  protected _dispatcher = new ServiceDispatcher();

  protected _pingIntervalTimer!: NodeJS.Timer;
  protected _pingTimeoutTimer!: NodeJS.Timeout;
  protected _lastPingSendTime = 0;

  protected constructor(options: AbstractServerOptions) {
    this.options = defaultsDeep(options, DefaultAbstractServerOptions);

    this._dispatcher.expose(new ServerChannelService(this) as unknown as IServiceInstance);
  }

  protected _clients = new Set<AbstractServerChannel<Context>>();

  public get clients(): ChannelGroup<Context> {
    return new ChannelGroup<Context>([...this._clients]);
  }

  public get client() {
    return re.channel() as AbstractServerChannel<Context>;
  }

  public start(...args: any[]): void | Promise<void> {
    this._pingIntervalTimer = setInterval(() => this.onPingInterval(), this.options.connection.pingInterval);
  }

  public stop(): void | Promise<void> {
    clearInterval(this._pingIntervalTimer);
    clearTimeout(this._pingTimeoutTimer);
  }

  public expose(service: IServiceInstance, id?: string) {
    this._dispatcher.expose(service, id);

    if (typeof service[onRecallServerInstall] == "function") {
      service[onRecallServerInstall].call(service, this);
    }
  }

  public on<T extends keyof EventMap>(eventName: T, callback: EventMap[T]) {
    this._emitter.on(eventName, callback);
  }

  public onPingInterval() {
    for (const it of this._clients) {
      it.notify<IClientChannelService>(RecallServiceChannelId).ping();
    }

    this._lastPingSendTime = Date.now();
    this._pingTimeoutTimer = setTimeout(() => this.onPingTimeout(), this.options.connection.pingTimeout);
  }

  public onPingTimeout() {
    for (const it of this._clients) {
      if (it.lastPingResponse < this._lastPingSendTime) {
        it.close(ChannelCloseReason.Timeout);
      }
    }
  }

  public onHandshake() {
    return {
      maxPingTimeout: this.options.connection.pingInterval + this.options.connection.pingTimeout,
    };
  }
}
