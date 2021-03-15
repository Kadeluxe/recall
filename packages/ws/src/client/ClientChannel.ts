import {
  AbstractClientChannel,
  ChannelState,
  INotificationMessage,
  IRequestMessage,
  IResponseMessage,
  ServiceDispatcher
} from "@kadeluxe/recall-core";
import {IWebSocketLike, IWebSocketLikeConstructor} from "~/common/IWebSocketLike";
import {WsClientOptionsFull} from "~/client/RecallWsClient";

export class ClientChannel extends AbstractClientChannel<undefined> {
  protected _socket!: IWebSocketLike;

  public constructor(
    protected readonly _wsCtor: IWebSocketLikeConstructor,
    dispatcher: ServiceDispatcher,
    protected readonly _options: WsClientOptionsFull,
  ) {
    super(undefined, dispatcher, _options);

    this.onSocketConnect = this.onSocketConnect.bind(this);
    this.onSocketClose = this.onSocketClose.bind(this);
    this.onSocketError = this.onSocketError.bind(this);
    this.onSocketMessage = this.onSocketMessage.bind(this);
  }

  public close(): void {
    this._socket.close();
  }

  public connect(): void {
    this._socket = new this._wsCtor(this._options.url);

    this._socket.addEventListener("open", this.onSocketConnect);
    this._socket.addEventListener("close", this.onSocketClose);
    this._socket.addEventListener("error", this.onSocketError);
    this._socket.addEventListener("message", this.onSocketMessage);
  }

  public sendMessage(message: INotificationMessage | IRequestMessage | IResponseMessage): void | Promise<void> {
    this._socket.send(JSON.stringify(message));
  }

  protected async onSocketMessage(ev: MessageEvent<string>) {
    try {
      const message: INotificationMessage | IRequestMessage = JSON.parse(ev.data);
      await this.onIncomingMessage(message);
    } catch (e) {
      throw e;
    }
  };

  protected onSocketConnect() {
    this.setChannelState(ChannelState.Connected);
  };

  protected onSocketClose() {
    // if (this.state == ChannelState.Ready) this._log("disconnected");
    this.setChannelState(ChannelState.Disconnected);
  }

  protected onSocketError() {

  }
}
