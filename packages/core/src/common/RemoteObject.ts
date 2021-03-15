import {createInvokeContext} from "~/service/InvokeContext";
import {AbstractChannel} from "~/channel/AbstractChannel";
import {IRequestSender} from "~/channel/IRequestSender";
import {VoidReturnTypes} from "~/utils/types";

export class RemoteObject<T> {
  public constructor(
    protected readonly _id: string,
    protected _defaultChannel?: AbstractChannel,
  ) {

  }

  public setDefaultChannel(channel: AbstractChannel) {
    this._defaultChannel = channel;

    return this;
  }

  public call(): T;
  public call(channel: IRequestSender): T;
  public call(channel?: IRequestSender): T {
    channel = channel ?? this._defaultChannel;
    if (!channel) {
      throw new Error(`Trying to make a call using undefined channel`);
    }

    return createInvokeContext(channel, this._id, true);
  }

  public notify(): VoidReturnTypes<T>;
  public notify(channel: IRequestSender): VoidReturnTypes<T>;
  public notify(channel?: IRequestSender): VoidReturnTypes<T> {
    channel = channel ?? this._defaultChannel;
    if (!channel) {
      throw new Error(`Trying to make a notify using undefined channel`);
    }

    return createInvokeContext(channel, this._id, false);
  }
}
