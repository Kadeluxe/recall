import {
  AbstractClient,
  AbstractClientOptions,
  ChannelCloseReason,
  DefaultAbstractClientOptions
} from "@kadeluxe/recall-core";
import {IWebSocketLikeConstructor} from "~/common/IWebSocketLike";
import {ClientChannel} from "~/client/ClientChannel";
import {DeepRequired} from "ts-essentials";
import defaultsDeep from "lodash/defaultsDeep";
import _ from "lodash";

export type WsClientOptions = { url: string } & AbstractClientOptions;
export type WsClientOptionsFull = DeepRequired<WsClientOptions>;
export const DefaultWsClientOptions = _.merge(
  {},
  DefaultAbstractClientOptions
);

export class RecallWsClient extends AbstractClient {
  public readonly options: WsClientOptionsFull;
  public readonly channel: ClientChannel;

  public constructor(ctor: IWebSocketLikeConstructor, options: WsClientOptions) {
    super();
    this.options = defaultsDeep(options, DefaultWsClientOptions);

    this.channel = new ClientChannel(ctor, this._dispatcher, this.options);
  }

  public start() {
    this.channel.connect();
  }

  public stop() {
    this.channel.close(ChannelCloseReason.Normal);
  }
}
