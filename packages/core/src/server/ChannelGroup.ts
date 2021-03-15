import {IRequestSender} from "~/channel/IRequestSender";
import {AbstractChannel} from "~/channel/AbstractChannel";
import {createInvokeContext} from "~/service/InvokeContext";
import {VoidReturnTypes} from "~/utils/types";

export class ChannelGroup<Context> implements IRequestSender {
  public constructor(
    public readonly channels: AbstractChannel<Context>[]
  ) {

  }

  public request(service: string, method: string, params: any[], isInvoke: boolean) {
    return Promise.allSettled(this.channels.map(it => it.request(service, method, params, isInvoke)));
  }

  public call<T>(service: string): T {
    return createInvokeContext(this, service, true);
  }

  public notify<T>(service: string): VoidReturnTypes<T> {
    return createInvokeContext(this, service, false);
  }
}
