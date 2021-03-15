import {Expose} from "~/decorators/Expose";
import {ServiceId} from "~/decorators/ServiceId";
import {RecallServiceChannelId} from "~/common/const";
import {re} from "~/server/runtime";
import {AbstractServer} from "~/server/AbstractServer";

@ServiceId(RecallServiceChannelId)
export class ServerChannelService implements IServerChannelService {
  public constructor(
    protected readonly _server: AbstractServer<any>,
  ) {

  }

  @Expose()
  public async handshake(params: IHandshakeRequest) {
    return this._server.onHandshake();
  }

  @Expose()
  public async pong() {
    re.channel().lastPingResponse = Date.now();
  }
}

export interface IHandshakeRequest {
  hint?: string;
  data?: Record<string, any>;
}

export interface IHandshakeResponse {
  maxPingTimeout: number;
}

export interface IServerChannelService {
  handshake(params: IHandshakeRequest): Promise<IHandshakeResponse>;

  pong(): Promise<void>;
}
