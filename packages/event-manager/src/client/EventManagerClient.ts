import {IEventManagerServer} from "~/server/EventManagerServer";
import {AbstractChannel, Expose, RemoteObject} from "@kadeluxe/recall-core";

export interface IEventManagerClient<EventMap> {
  emitLocally<T extends keyof EventMap>(eventName: T, params: EventMap[T]): Promise<void>;
}

type EventCallback<Data> = (ev: Data) => any;

export class EventManagerClient<EventMap = { [key: string]: any }> implements IEventManagerClient<EventMap> {
  protected readonly _serverInstance: RemoteObject<IEventManagerServer<EventMap>>;
  protected readonly _listeners = new Map<keyof EventMap, Set<EventCallback<any>>>();

  public constructor(serviceId: string, channel?: AbstractChannel) {
    this._serverInstance = new RemoteObject<IEventManagerServer<EventMap>>(serviceId, channel);
  }

  public on<T extends keyof EventMap>(eventName: T, callback: EventCallback<EventMap[T]>) {
    const callbacks = this._listeners.get(eventName);
    if (callbacks) {
      callbacks.add(callback);
    } else {
      this._listeners.set(eventName, new Set([callback]));
    }
  }

  public once<T extends keyof EventMap>(eventName: T, callback: EventCallback<EventMap[T]>) {
    const wrapped = (ev: EventMap[T]) => {
      this.off(eventName, wrapped);

      callback(ev);
    };

    this.on(eventName, wrapped);
  }

  public off<T extends keyof EventMap>(eventName: T, callback: EventCallback<EventMap[T]>) {
    const callbacks = this._listeners.get(eventName);
    if (callbacks) callbacks.delete(callback);
  }

  public async subscribe(...events: (keyof EventMap)[]) {
    return await this._serverInstance.call().subscribe(events);
  }

  public emit(event: keyof EventMap, params: any) {
    this._serverInstance.notify().broadcast(event, params);
  }

  @Expose()
  public async emitLocally<T extends keyof EventMap>(eventName: T, params: EventMap[T]) {
    const callbacks = this._listeners.get(eventName);
    if (callbacks) {
      for (const it of [...callbacks]) {
        it(params);
      }
    }
  }
}
