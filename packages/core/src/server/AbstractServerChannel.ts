import {AbstractChannel} from "~/channel/AbstractChannel";
import {ServiceDispatcher} from "~/dispatcher/ServiceDispatcher";
import {AbstractChannelOptionsFull} from "~/channel/options";

export abstract class AbstractServerChannel<Context = unknown> extends AbstractChannel<Context> {
  protected constructor(
    ctx: Context,
    dispatcher: ServiceDispatcher,
    options: AbstractChannelOptionsFull
  ) {
    super(ctx, dispatcher, options);

    this._lastPingResponse = Date.now();
  }

  protected _lastPingResponse: number;

  public get lastPingResponse() {
    return this._lastPingResponse;
  }

  /**
   * @internal
   */
  public set lastPingResponse(value: number) {
    this._lastPingResponse = value;
  }
}
