import * as net from "net";
import {DeepRequired} from "ts-essentials";
import _, {defaultsDeep} from "lodash";
import {
  AbstractClient,
  AbstractClientOptions,
  ChannelCloseReason,
  DefaultAbstractClientOptions
} from "@kadeluxe/recall-core";
import {ClientChannel} from "~/index";

export type TcpClientOptions = {
  socket: net.SocketConnectOpts;
} & AbstractClientOptions;
export type TcpClientOptionsFull = DeepRequired<TcpClientOptions>;
export const DefaultTcpClientOptions = _.merge(
  {},
  DefaultAbstractClientOptions
);

export class RecallTcpClient extends AbstractClient {
  public readonly options: TcpClientOptionsFull;
  public readonly channel: ClientChannel;

  constructor(options: TcpClientOptions) {
    super();
    this.options = defaultsDeep(options, DefaultTcpClientOptions);

    this.channel = new ClientChannel(this._dispatcher, this.options);
  }

  public start() {
    this.channel.connect();
    return;
  }

  public stop() {
    this.channel.close(ChannelCloseReason.Normal);
    return;
  }

}
