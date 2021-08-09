import {
  AbstractClientChannel,
  ChannelCloseReason,
  ChannelState,
  INotificationMessage,
  IRequestMessage,
  IResponseMessage,
  ServiceDispatcher
} from "@kadeluxe/recall-core";
import * as net from "net";
import {FrameStreamDecoder} from "~/encoders/FrameStreamDecoder";
import {FrameStreamEncoder} from "~/encoders/FrameStreamEncoder";
import {TcpClientOptionsFull} from "~/client/RecallTcpClient";

export class ClientChannel extends AbstractClientChannel<undefined> {
  public readonly socket = new net.Socket();

  protected _encoder = new FrameStreamEncoder();
  protected _decoder = new FrameStreamDecoder();

  public constructor(
    dispatcher: ServiceDispatcher,
    protected readonly _options: TcpClientOptionsFull
  ) {
    super(undefined, dispatcher, _options);

    this.onSocketConnect = this.onSocketConnect.bind(this);
    this.onSocketData = this.onSocketData.bind(this);
    this.onSocketClose = this.onSocketClose.bind(this);
    this.onSocketError = this.onSocketError.bind(this);

    this.socket.on("connect", this.onSocketConnect);
    this.socket.on("close", this.onSocketClose);
    this.socket.on("error", this.onSocketError);

    this.socket.pipe(this._decoder);
    this._decoder.on("data", this.onSocketData);
  }

  public connect() {
    this.socket.connect(this._options.socket);
  }

  public close(reason: ChannelCloseReason) {
    this.socket.destroy();
  }

  public sendMessage(message: INotificationMessage | IRequestMessage | IResponseMessage) {
    this._encoder.write(Buffer.from(JSON.stringify(message)));
  }

  protected async onSocketData(buffer: Buffer | string) {
    buffer = buffer.toString();

    const message: INotificationMessage | IRequestMessage = JSON.parse(buffer);
    await this.onIncomingMessage(message);
  };

  protected onSocketConnect() {
    this.setChannelState(ChannelState.Connected);
    // Readable unpipes on dest close, so we should pipe every time after connect
    this._encoder.pipe(this.socket);
  };

  protected onSocketClose() {
    this.setChannelState(ChannelState.Disconnected);
  }

  protected onSocketError() {

  }
}
