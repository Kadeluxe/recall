import {Expose} from "~/decorators/Expose";
import {ServiceId} from "~/decorators/ServiceId";
import {RecallServiceChannelId} from "~/common/const";
import {IServerChannelService} from "~/server/ServerChannelService";
import {AbstractClient} from "~/client/AbstractClient";

@ServiceId(RecallServiceChannelId)
export class ClientChannelService implements IClientChannelService {
  public constructor(
    protected readonly _client: AbstractClient
  ) {

  }

  @Expose()
  async ping() {
    this._client.channel.resetPingTimeout();
    this._client.channel.notify<IServerChannelService>(RecallServiceChannelId).pong();
  }
}

export interface IClientChannelService {
  ping(): Promise<void>;
}
