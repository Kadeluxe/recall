import {IRequestSender} from "~/channel/IRequestSender";

export function createInvokeContext(channel: IRequestSender, service: string, isInvoke: boolean = true) {
  return new Proxy({}, {
    get(target: any, method: string | symbol) {
      if (typeof method !== "string") {
        throw new Error(`Can not invoke remote: expected method name as a string, got ${typeof method}`);
      }

      return function InvokeContext_SendRequest(...params: any[]) {
        return channel.request(service, method, params, isInvoke);
      };
    },
  });
}
