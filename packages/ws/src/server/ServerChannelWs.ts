import {
  AbstractServerChannel,
  captureRequestContext,
  ChannelCloseReason,
  ChannelState,
  INotificationMessage,
  IRequestMessage,
  IResponseMessage,
  ServiceDispatcher
} from "@kadeluxe/recall-core";
import {RecallWsServer, WsServerOptionsFull} from "~/server/RecallWsServer";
import WebSocket from "ws";

export class ServerChannelWs<Context> extends AbstractServerChannel<Context> {
  public constructor(
    protected readonly _socket: WebSocket,
    protected readonly _server: RecallWsServer,
    ctx: Context,
    dispatcher: ServiceDispatcher,
    protected readonly _options: WsServerOptionsFull<Context>
  ) {
    super(ctx, dispatcher, _options);

    this.onSocketData = this.onSocketData.bind(this);
    this.onSocketClose = this.onSocketClose.bind(this);

    _socket.on("message", this.onSocketData);
    _socket.once("close", this.onSocketClose);
  }

  public close(reason: ChannelCloseReason): void {
    this._socket.close();
  }

  public sendMessage(message: INotificationMessage | IRequestMessage | IResponseMessage): void | Promise<void> {
    return this._socket.send(JSON.stringify(message));
  }

  protected async onSocketData(data: WebSocket.Data) {
    if (typeof data == "string") {
      try {
        const message: INotificationMessage | IRequestMessage = JSON.parse(data);
        await captureRequestContext(this, this._server, () => this.onIncomingMessage(message));
      } catch (e) {
        throw e;
      }
    }
  }

  protected onSocketClose() {
    this.setChannelState(ChannelState.Disconnected);
  }
}
