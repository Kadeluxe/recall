import {AbstractChannel, ChannelState} from "~/channel/AbstractChannel";
import {ServiceDispatcher} from "~/dispatcher/ServiceDispatcher";
import {IHandshakeResponse, IServerChannelService} from "~/server/ServerChannelService";
import {RecallServiceChannelId} from "~/common/const";
import {AbstractClientOptionsFull} from "~/client/options";
import {Backoff} from "~/client/Backoff";

export abstract class AbstractClientChannel<Context = unknown> extends AbstractChannel<Context> {
  protected _maxPingTimeout!: number;
  protected _pingTimer!: NodeJS.Timeout;
  protected _backoff: Backoff;

  protected constructor(
    ctx: Context,
    dispatcher: ServiceDispatcher,
    protected readonly _options: AbstractClientOptionsFull
  ) {
    super(ctx, dispatcher, _options);

    this._backoff = new Backoff(_options.connection.reconnect.initialDelay, _options.connection.reconnect.maxDelay);
    this.onHandshakeResponse = this.onHandshakeResponse.bind(this);
  }

  public abstract connect(): void;

  /**
   * @internal
   */
  public resetPingTimeout() {
    clearTimeout(this._pingTimer);
    this._pingTimer = setTimeout(() => this.onPingTimeout(), this._maxPingTimeout);
  }

  protected setChannelState(state: ChannelState) {
    super.setChannelState(state);

    if (state == ChannelState.Connected) {
      this.call<IServerChannelService>(RecallServiceChannelId).handshake({}).then(this.onHandshakeResponse).catch(() => this.close());
    } else if (state == ChannelState.Ready) {
      this.resetPingTimeout();
    } else if (state == ChannelState.Disconnected) {
      if (this._options.connection.reconnect) {
        this._backoff.scheduleNext(this.connect.bind(this));
      }
    }
  }

  protected onHandshakeResponse(response: IHandshakeResponse) {
    this._maxPingTimeout = response.maxPingTimeout;

    this.setChannelState(ChannelState.Ready);
  }

  protected onPingTimeout() {
    this.close();
  }
}
