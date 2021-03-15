import * as net from "net";
import {
  AbstractServerChannel,
  captureRequestContext,
  ChannelState,
  INotificationMessage,
  IRequestMessage,
  IResponseMessage,
  ServiceDispatcher
} from "@kadeluxe/recall-core";
import {FrameStreamEncoder} from "~/encoders/FrameStreamEncoder";
import {FrameStreamDecoder} from "~/encoders/FrameStreamDecoder";
import {RecallTcpServer, TcpServerOptionsFull} from "~/server/RecallTcpServer";

export class ServerChannelTcp<Context> extends AbstractServerChannel<Context> {
  protected _encoder: FrameStreamEncoder;
  protected _decoder: FrameStreamDecoder;

  public constructor(
    protected readonly _socket: net.Socket,
    protected readonly _server: RecallTcpServer,
    ctx: Context,
    dispatcher: ServiceDispatcher,
    protected readonly _options: TcpServerOptionsFull,
  ) {
    super(ctx, dispatcher, _options);

    this._encoder = new FrameStreamEncoder();
    this._decoder = new FrameStreamDecoder(this._options.maxMessageSize);

    this.onSocketData = this.onSocketData.bind(this);
    this.onSocketClose = this.onSocketClose.bind(this);
    this.onSocketError = this.onSocketError.bind(this);

    this._socket.pipe(this._decoder);
    this._decoder.on("data", this.onSocketData);
    this._socket.on("close", this.onSocketClose);
    this._socket.on("error", this.onSocketError);

    this._encoder.pipe(this._socket);
  }

  public close() {
    this._socket.destroy();
  }

  public sendMessage(message: INotificationMessage | IRequestMessage | IResponseMessage) {
    this._encoder.write(Buffer.from(JSON.stringify(message)));
  }

  protected onSocketError(err: Error) {
    throw err;
  }

  protected onSocketClose() {
    this.setChannelState(ChannelState.Disconnected);
  }

  protected async onSocketData(buffer: Buffer | string) {
    try {
      buffer = buffer.toString();

      const message: INotificationMessage | IRequestMessage = JSON.parse(buffer);
      await captureRequestContext(this, this._server, () => this.onIncomingMessage(message));
    } catch (e) {
      throw e;
    }
  };
}
