import {
  AbstractServer,
  AbstractServerChannel,
  ChannelGroup,
  Expose,
  onRecallServerInstall,
  re,
  RemoteObject
} from "@kadeluxe/recall-core";
import {IEventManagerClient} from "~/client/EventManagerClient";

export interface IEventManagerServer<EventMap> {
  subscribe(events: (keyof EventMap)[]): Promise<boolean>;

  broadcast<T extends keyof EventMap>(event: keyof EventMap, params: EventMap[T]): Promise<number>;
}

const ClientContext = Symbol();

interface IContext<EventMap> {
  [ClientContext]: {
    subscriptions: (keyof EventMap)[];
  };
}

export class EventManagerServer<EventMap = { [key: string]: any }> implements IEventManagerServer<EventMap> {
  protected _subscriptions = new Map<keyof EventMap, Set<AbstractServerChannel<IContext<EventMap>>>>();
  protected _server!: AbstractServer;

  protected _clientInstance: RemoteObject<IEventManagerClient<EventMap>>;

  public constructor(serviceId: string) {
    this._clientInstance = new RemoteObject<IEventManagerClient<EventMap>>(serviceId);
  }

  public [onRecallServerInstall](server: AbstractServer) {
    this._server = server;

    server.on("client:connect", (client: AbstractServerChannel<IContext<EventMap>>) => {
      client.ctx[ClientContext] = {subscriptions: []};
    });

    server.on("client:disconnect", (client: AbstractServerChannel<IContext<EventMap>>) => {
      for (const event of client.ctx[ClientContext].subscriptions) {
        this._subscriptions.get(event)!.delete(client);
      }
    });
  }

  @Expose()
  public async subscribe(events: (keyof EventMap)[]) {
    for (const event of events) {
      if (!this._subscriptions.has(event)) this._subscriptions.set(event, new Set());
      this._subscriptions.get(event)!.add(re.channel());
    }

    return true;
  }

  @Expose()
  public async broadcast(event: keyof EventMap, params: any) {
    const subscribers = this._subscriptions.get(event);
    if (subscribers && subscribers.size) {
      await this._clientInstance.notify(new ChannelGroup([...subscribers])).emitLocally(event, params);

      return subscribers.size;
    }

    return 0;
  }
}
