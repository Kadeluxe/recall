import {AbstractServer, AbstractServerOptions, DefaultAbstractServerOptions, re} from "@kadeluxe/recall-core";
import * as net from "net";
import {ServerChannelTcp} from "~/server/ServerChannelTcp";
import _ from "lodash";
import {DeepRequired} from "ts-essentials";

export type TcpServerOptions = {
  maxMessageSize?: number
} & AbstractServerOptions;
export type TcpServerOptionsFull = DeepRequired<TcpServerOptions>;
export const DefaultTcpServerOptions: TcpServerOptionsFull = _.merge(
  {
    maxMessageSize: 100 * 1024 * 1024, // 100 MB
  },
  DefaultAbstractServerOptions
);

export class RecallTcpServer<Context = unknown> extends AbstractServer<Context> {
  declare protected _clients: Set<ServerChannelTcp<Context>>;
  public readonly options: TcpServerOptionsFull;
  protected readonly _server = new net.Server();

  public constructor(options: TcpServerOptions = {}) {
    super(options);
    this.options = _.defaultsDeep(options, DefaultTcpServerOptions);

    this.onClientConnect = this.onClientConnect.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    this.onListening = this.onListening.bind(this);

    this._server.on("connection", this.onClientConnect);
    this._server.on("close", this.onClose);
    this._server.on("error", this.onError);
    this._server.on("listening", this.onListening);
  }

  public get client() {
    return re.channel<ServerChannelTcp<Context>>();
  }

  public start(options: net.ListenOptions) {
    this._server.listen(options);

    super.start();
  }

  public stop(...args: any[]) {
    this._server.close();
  }

  protected async onClientConnect(socket: net.Socket) {
    const client = new ServerChannelTcp<Context>(socket, this, {} as any, this._dispatcher, this.options);
    this._clients.add(client);

    socket.once("close", () => this.onClientDisconnect(client));
    this._emitter.emit("client:connect", client);
  }

  protected async onClientDisconnect(client: ServerChannelTcp<any>) {
    this._emitter.emit("client:disconnect", client);

    this._clients.delete(client);
  }

  protected onClose() {

  }

  protected onError(err: Error) {

  }

  protected onListening() {

  }
}
