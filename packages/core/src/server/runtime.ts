import {AsyncLocalStorage} from "async_hooks";
import {AbstractServer} from "~/server/AbstractServer";
import {AbstractChannel} from "~/channel/AbstractChannel";
import {Newable} from "ts-essentials";
import {AbstractServerChannel} from "~/server/AbstractServerChannel";

interface IRequestData {
  channel: AbstractChannel;
  server: AbstractServer;
}

const asyncLocalStorage = new AsyncLocalStorage<IRequestData>();

export function captureRequestContext(channel: AbstractChannel, server: AbstractServer, callback: (...args: any) => any) {
  return asyncLocalStorage.run({channel, server}, callback);
}

interface IRecallContextGetter {
  channel<T extends AbstractServerChannel = AbstractServerChannel>(): T;

  server<T extends AbstractServer = AbstractServer>(): T;
}

export const re: IRecallContextGetter = {
  channel<T extends AbstractChannel = AbstractChannel>(): T {
    const data = asyncLocalStorage.getStore();
    if (!data) throw new Error("Not inside Recall async context");

    return data.channel as T;
  },

  server<T extends AbstractServer = AbstractServer>(): T {
    const data = asyncLocalStorage.getStore();
    if (!data) throw new Error("Not inside Recall async context");

    return data.server as T;
  }
};

export function recallContextGetter<Server extends AbstractServer, Channel extends AbstractChannel>(serverClass: Newable<Server>, channelClass: Newable<Channel>) {
  return {
    channel() {
      const channel = re.channel();
      if (channel instanceof channelClass) {
        return channel;
      }

      throw new Error(`Client inside async context is not an instance of ${channelClass.name}`);
    },
    server() {
      const server = re.server();
      if (server instanceof serverClass) {
        return server as Server;
      }

      throw new Error(`Server inside async context is not an instance of ${serverClass.name}`);
    }
  };
}
