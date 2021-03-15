import {AbstractRemote, InvokeContext, InvokeContextExtensions, ServerDispatcher} from "@recall/core";

export function RemoteClient<T>(server: ServerDispatcher<T>, remote: AbstractRemote): T & InvokeContextExtensions {
  return new Proxy({}, {
    get(target: {}, prop: string): any {
      return new InvokeContext(server, remote)[prop as keyof InvokeContext];
    },
  }) as T & InvokeContextExtensions;
}
