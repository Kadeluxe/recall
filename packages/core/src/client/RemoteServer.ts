import {ClientDispatcher, InvokeContext, InvokeContextExtensions} from "@recall/core";

export function RemoteServer<TRemote>(client: ClientDispatcher): TRemote & InvokeContextExtensions {
  return new Proxy({}, {
    get(target: {}, prop: string): any {
      return new InvokeContext(client, client.server)[prop as keyof InvokeContext];
    },
  }) as TRemote & InvokeContextExtensions;
}
