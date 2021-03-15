import {ServiceDispatcher} from "~/dispatcher/ServiceDispatcher";
import {IServiceInstance} from "~/service/IServiceInstance";
import {onRecallClientInstall, onRecallServerInstall} from "~/shared/symbols";
import {InstanceDescriptor} from "~/service/ServiceClassDescriptor";
import {RemoteObject} from "~/common/RemoteObject";
import {ClientChannelService} from "~/client/ClientChannelService";
import {AbstractClientChannel} from "~/client/AbstractClientChannel";

export abstract class AbstractClient {
  public abstract readonly channel: AbstractClientChannel;
  protected readonly _dispatcher = new ServiceDispatcher();

  protected constructor() {
    this._dispatcher.expose(new ClientChannelService(this) as unknown as IServiceInstance);
  }

  public abstract start(): void | Promise<void>;

  public abstract stop(): void | Promise<void>;

  public expose(service: IServiceInstance, id?: string) {
    this._dispatcher.expose(service, id);

    for (const key of service[InstanceDescriptor].classDescriptor.defaultChannel) {
      const remoteObject = (service as any)[key];
      if (remoteObject instanceof RemoteObject) {
        remoteObject.setDefaultChannel(this.channel);
      }
    }

    if (typeof service[onRecallServerInstall] == "function") {
      service[onRecallClientInstall].call(service, this);
    }
  }
}
