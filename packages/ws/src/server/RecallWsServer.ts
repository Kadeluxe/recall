import {AbstractServer, AbstractServerOptions, DefaultAbstractServerOptions} from "@kadeluxe/recall-core";
import WebSocket from "ws";
import {DeepRequired} from "ts-essentials";
import {ServerChannelWs} from "~/server/ServerChannelWs";
import {IncomingMessage} from "http";
import _ from "lodash";

export type WsServerOptions = {} & AbstractServerOptions;
export type WsServerOptionsFull = DeepRequired<WsServerOptions>;
export const DefaultWsServerOptions: WsServerOptionsFull = _.merge(
  {},
  DefaultAbstractServerOptions,
);

export class RecallWsServer<Context = unknown> extends AbstractServer<Context> {
  declare protected _clients: Set<ServerChannelWs<Context>>;
  public readonly options: WsServerOptionsFull;

  public constructor(
    protected readonly _server: WebSocket.Server,
    options: WsServerOptions = {}
  ) {
    super(options);
    this.options = _.defaultsDeep(options, DefaultWsServerOptions);

    this.onClientConnect = this.onClientConnect.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
    this.onListening = this.onListening.bind(this);

    _server.on("connection", this.onClientConnect);
    _server.on("close", this.onClose);
    _server.on("error", this.onError);
    _server.on("listening", this.onListening);
  }

  public start() {
    super.start();
  }

  public stop() {
    this._server.close();
  }

  protected async onClientConnect(socket: WebSocket, req: IncomingMessage) {
    const client = new ServerChannelWs<Context>(socket, this, {} as any, this._dispatcher, this.options);
    this._clients.add(client);

    socket.once("close", () => this.onClientDisconnect(client));
    this._emitter.emit("client:connect", client);
  }

  protected async onClientDisconnect(client: ServerChannelWs<any>) {
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
